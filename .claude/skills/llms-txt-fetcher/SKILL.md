---
name: llms-txt-fetcher
description: 获取和解析 llms.txt 文档（LLM 友好的网站内容索引）。当用户需要：(1) 了解某技术/框架的核心文档结构，(2) 快速获取某网站的关键信息导航，(3) 提到 "llms.txt"、"llm 文档"、"文档索引" 时，(4) **Agent 不了解某块知识需要快速查阅时**（如 CopilotKit、Next.js 等），使用此技能通过预配置的 llms.txt URL 获取结构化文档指引。支持配置多个站点的 llms.txt 地址。
---

# llms.txt Fetcher — Expert Guide

## 核心心智模式

**llms.txt 是什么**：

- llmstxt 是一个**LLM 友好的网站内容索引**，类似网站的"文档地图"
- 它是一个 markdown 文件，提供网站的简短摘要、关键信息，以及指向详细 markdown 文档的链接
- 当 Agent 不了解某块知识时，通过 llmstxt 可以快速获取该技术的核心文档结构和关键信息

**典型使用场景**：

- Agent 需要了解 CopilotKit 的核心概念和 API → 查询 `https://docs.copilotkit.ai/llms.txt`
- Agent 需要了解 Next.js 的文档结构 → 查询 `https://nextjs.org/llms.txt`
- Agent 需要快速掌握某个技术的要点 → 查询对应网站的 llms.txt

**配置化 URL 设计**：
支持使用简短的 key 来引用预配置的 llms.txt 地址，格式为 `key: url`：

```
copilotkit: https://docs.copilotkit.ai/llms.txt
nextjs: https://nextjs.org/llms.txt
fasthtml: https://fastht.ml/llms.txt
```

---

## 可配置 URL 列表

### 默认配置位置

在 `references/configured-sites.md` 中维护已配置的 llms.txt 地址列表（如存在该文件则读取）。

### 常用配置示例

```markdown
## 前端/全栈框架

- nextjs: https://nextjs.org/llms.txt
- nuxt: https://nuxt.com/llms.txt
- remix: https://remix.run/llms.txt

## AI/Agent 框架

- copilotkit: https://docs.copilotkit.ai/llms.txt
- langchain: https://python.langchain.com/llms.txt
- crewai: https://docs.crewai.com/llms.txt

## 全栈框架

- fasthtml: https://fastht.ml/llms.txt
- laravel: https://laravel.com/llms.txt
```

### 如何添加新配置

当用户需要使用新的 llms.txt 地址时：

1. 检查是否已有该站点的配置
2. 如无配置，询问用户是否需要添加到 `references/configured-sites.md`
3. 或直接使用完整 URL 获取

---

## 获取策略 — 决策树

### 第一步：解析用户输入

用户可能以以下方式请求：

1. **使用配置 key**：`"获取 copilotkit 的 llms.txt"` → 查找配置中的 URL
2. **直接给 URL**：`"获取 https://docs.copilotkit.ai/llms.txt 的内容"` → 直接使用
3. **给域名**：`"获取 nextjs.org 的 llms.txt"` → 拼接 URL

### 第二步：获取流程

```
用户请求获取 llms.txt
         │
         ▼
┌─────────────────────────┐
│ 输入类型是什么？          │
└──────────┬──────────────┘
           │
    ┌──────┼──────┐
    │      │      │
  配置 key  完整 URL  域名
    │      │      │
    │      │      ▼
    │      │  按优先级尝试：
    │      │  1. https://<domain>/llms.txt
    │      │  2. https://<domain>/.well-known/llms.txt
    │      │  3. https://www.<domain>/llms.txt
    │      │
    │      ▼
    │   直接获取
    │
    ▼
查找 references/configured-sites.md
获取对应 URL
    │
    ▼
┌─────────────────────────────────┐
│ 使用 curl 获取内容并验证          │
└─────────────────────────────────┘
```

---

## 标准获取流程

### Step 1: 获取内容

```bash
# 基础获取（推荐）
curl -sSL --max-time 10 "https://<domain>/llms.txt"

# 需要验证内容类型时
curl -sSL --max-time 10 -w "\nContent-Type: %{content_type}\nHTTP Code: %{http_code}" "https://<domain>/llms.txt"
```

### Step 2: 验证响应（MANDATORY）

**有效 llms.txt 的特征**：

- HTTP 状态码 200
- Content-Type 包含 `text/plain` 或 `text/markdown`
- 内容包含标准字段（见下表）

**无效响应识别**：
| 状态码 | 含义 | 响应 |
|--------|------|------|
| 404 | 文件不存在 | 告知用户并建议备选方案 |
| 403 | 禁止访问 | 可能需 User-Agent 或认证 |
| 200 但 HTML | 返回错误页面 | 检测 `<html>` 或 `<!DOCTYPE>` |
| 超时 | 网络问题 | 尝试备用域名或告知用户 |

### Step 3: 解析内容

**llms.txt 标准结构**：

| 部分     | 说明                 | 示例                         |
| -------- | -------------------- | ---------------------------- |
| H1 标题  | 项目/网站名称        | `# FastHTML`                 |
| 引用摘要 | 简短的项目概述       | `> FastHTML 是一个...`       |
| 链接列表 | 指向详细文档的链接   | `- [安装指南](./install.md)` |
| 可选章节 | 按主题组织的额外链接 | `## API 文档`                |

**解析后的输出格式**：

```markdown
# [项目名] llms.txt

## 摘要

[引用摘要内容]

## 可用文档

- [文档名 1](链接 1) - [如有描述]
- [文档名 2](链接 2) - [如有描述]

## 建议阅读顺序

[根据内容推断或列出推荐顺序]
```

---

## NEVER 列表（反模式）

```markdown
NEVER 假设获取到的就是有效的 llms.txt：

- 可能返回 HTML 错误页面（检查是否包含 <html>、<!DOCTYPE>）
- 可能是重定向到登录页
- 可能是默认 404 页面

NEVER 不验证就展示给用户：

- 先检查内容是否为 markdown 格式（是否有 H1 引用、链接列表）
- 如果看起来像 HTML，告知用户"可能不是有效文档"

NEVER 只尝试一次就放弃：

- /llms.txt 失败 → 尝试 /.well-known/llms.txt
- 仍失败 → 尝试加 www 前缀
- 都失败 → 明确告知用户"该网站未提供 llms.txt"

NEVER 混淆 llms.txt 与：

- API 文档（通常是 /docs 或 /api/docs）
- OpenAPI/Swagger 规范（/openapi.json）
- robots.txt（用于爬虫，不是 AI）

NEVER 忽略配置的 key：

- 用户说"copilotkit" → 应先查找配置，而不是直接拼接域名
```

---

## 边缘情况处理

### 场景 1: 返回 HTML 而非纯文本

```bash
# 检测方法
content=$(curl -sSL --max-time 10 "https://<domain>/llms.txt")
if echo "$content" | grep -q "<html\|<!DOCTYPE"; then
  # 返回的是 HTML，不是有效 llms.txt
fi
```

### 场景 2: 需要特定 User-Agent

```bash
# 某些网站阻止默认 curl UA
curl -sSL --max-time 10 -A "Mozilla/5.0" "https://<domain>/llms.txt"
```

### 场景 3: SSL 证书问题

```bash
# 开发环境或自签名证书
curl -sSL --max-time 10 -k "https://<domain>/llms.txt"
```

### 场景 4: 内容过大

```bash
# 限制下载大小（前 50KB）
curl -sSL --max-time 10 --max-filesize 51200 "https://<domain>/llms.txt"
```

---

## 失败响应模板

| 情况      | 响应                                                                 |
| --------- | -------------------------------------------------------------------- |
| 404       | "该网站未提供 llms.txt 文件。可能需要查阅其 API 文档。"              |
| HTML 响应 | "获取的内容看起来是 HTML 页面而非 llms.txt 文档，可能该地址不正确。" |
| 超时      | "请求超时，可能是网络问题或该网站响应缓慢。"                         |
| 空内容    | "文件存在但内容为空，可能尚未配置。"                                 |

---

## 备选方案

当 llms.txt 不存在时，建议用户：

1. **查找 API 文档**: `https://<domain>/docs`、`https://<domain>/api/docs`
2. **查找 OpenAPI 规范**: `https://<domain>/openapi.json`、`https://<domain>/swagger.json`
3. **查看 /.well-known/**: `https://<domain>/.well-known/` 可能有其他发现

---

## 参考资源

- **llms.txt 标准**: https://llmstxt.org/
- **示例集合**: https://github.com/llmstxt/llms.txt
