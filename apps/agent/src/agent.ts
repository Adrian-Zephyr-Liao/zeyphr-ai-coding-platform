/**
 * This is the main entry point for the agent.
 * It defines the workflow graph, state, tools, nodes and edges.
 */

import { z } from "zod";
import { SystemMessage } from "@langchain/core/messages";
import type { AIMessage } from "@langchain/core/messages";
import type { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { Annotation, MemorySaver, START, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import {
  CopilotKitStateAnnotation,
  convertActionsToDynamicStructuredTools,
} from "@copilotkit/sdk-js/langgraph";

// 1. Define our agent state, which includes CopilotKit state to
//    Provide actions to the state.
const AgentStateAnnotation = Annotation.Root({
  ...CopilotKitStateAnnotation.spec, // CopilotKit state annotation already includes messages, as well as frontend tools
  proverbs: Annotation<string[]>,
});

// 2. Define the type for our agent state
export type AgentState = typeof AgentStateAnnotation.State;

// Last index constant
const LAST_INDEX = -1;

// 3. Define a simple tool to get the weather statically
const getWeather = tool(
  (args) =>
    `The weather for ${args.location} is 70 degrees, clear skies, 45% humidity, 5 mph wind, and feels like 72 degrees.`,
  {
    description: "Get the weather for a given location.",
    name: "getWeather",
    schema: z.object({
      location: z.string().describe("The location to get weather for"),
    }),
  },
);

// 4. Put our tools into an array
const tools = [getWeather];

// 5. Define the chat node, which will handle the chat logic
const chat_node = async (state: AgentState, config: RunnableConfig) => {
  // 5.1 Define the model, lower temperature for deterministic responses
  const model = new ChatOpenAI({
    model: "qwen3.5-plus",
    temperature: 0,
    apiKey: process.env.DASHSCOPE_API_KEY,
    configuration: {
      baseURL: process.env.DASHSCOPE_BASE_URL,
    },
  });

  // 5.2 Bind the tools to the model, include CopilotKit actions. This allows
  //     The model to call tools that are defined in CopilotKit by the frontend.
  const modelWithTools = model.bindTools!([
    ...convertActionsToDynamicStructuredTools(state.copilotkit?.actions ?? []),
    ...tools,
  ]);

  // 5.3 Define the system message, which will be used to guide the model, in this case
  //     We also add in the language to use from the state.
  const systemMessage = new SystemMessage({
    content: `You are a helpful assistant. The current proverbs are ${JSON.stringify(state.proverbs)}.`,
  });

  // 5.4 Invoke the model with the system message and the messages in the state
  const response = await modelWithTools.invoke([systemMessage, ...state.messages], config);

  // 5.5 Return the response, which will be added to the state
  return {
    messages: response,
  };
};

// 6. Define the function that determines whether to continue or not,
//    This is used to determine the next node to run
const shouldContinue = ({ messages, copilotkit }: AgentState) => {
  // 6.1 Get the last message from the state
  const lastMessage = messages[messages.length + LAST_INDEX] as AIMessage;

  // 7.2 If the LLM makes a tool call, then we route to the "tools" node
  if (lastMessage.tool_calls?.length) {
    // Actions are the frontend tools coming from CopilotKit
    const actions = copilotkit?.actions;
    const firstToolCallIndex = 0;
    const toolCallName = lastMessage.tool_calls![firstToolCallIndex].name;

    // 7.3 Only route to the tool node if the tool call is not a CopilotKit action
    if (!actions || actions.every((action) => action.name !== toolCallName)) {
      return "tool_node";
    }
  }

  // 6.4 Otherwise, we stop (reply to the user) using the special "__end__" node
  return "__end__";
};

// Define the workflow graph
const workflow = new StateGraph(AgentStateAnnotation)
  .addNode("chat_node", chat_node)
  .addNode("tool_node", new ToolNode(tools))
  .addEdge(START, "chat_node")
  .addEdge("tool_node", "chat_node")
  .addConditionalEdges("chat_node", shouldContinue as any);

const memory = new MemorySaver();

export const graph = workflow.compile({
  checkpointer: memory,
});
