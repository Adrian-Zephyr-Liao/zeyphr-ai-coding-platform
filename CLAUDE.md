# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A monorepo starter for building AI agents using LangGraph and CopilotKit with a Next.js frontend.

## Architecture

This is a Turborepo monorepo with two workspaces:

- **apps/web** - Next.js frontend application with CopilotKit React integration
- **apps/agent** - LangGraph agent backend

## Development Commands

All commands use pnpm as the package manager:

```bash
# Install dependencies
pnpm install

# Development (runs both web and agent)
pnpm dev

# Run for specific app
pnpm --filter web dev      # Web app only (port 3000)
pnpm --filter agent dev    # Agent only (port 8123)

# Build
pnpm build

# Lint and format
pnpm lint          # Run oxlint
pnpm lint:fix      # Auto-fix issues
pnpm format        # Format with oxfmt
pnpm format:check  # Check formatting
```

## Environment Setup

The agent requires an OpenAI API key in `apps/agent/.env`:

```
OPENAI_API_KEY=your-openai-api-key-here
```

## Code Quality Tools

- **Linting**: oxlint
- **Formatting**: oxfmt
- **Commits**: commitizen with cz-git (conventional commits with emoji)
- **Pre-commit hooks**: lint-staged runs format + lint on staged files

## Key Dependencies

- LangGraph (@langchain/langgraph) - Agent framework
- CopilotKit - UI components and state management
- Next.js 16 - Frontend framework
- Tailwind CSS 4 - Styling
- Zod - Runtime validation
