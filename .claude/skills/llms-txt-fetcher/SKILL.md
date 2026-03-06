---
name: llms-txt-fetcher
description: 获取和解析 llms.txt 文档（AI 模型交互标准格式）。当用户需要：(1) 获取某个网站的 llms.txt 文件，(2) 了解 AI 服务的模型支持情况，(3) 查询 LLM 集成文档，(4) 提到 "llms.txt"、"llm 文档"、"AI 文档索引"、"模型端点" 时使用此技能。
---

# llms.txt Fetcher — Expert Guide

## 核心心智模式

**llms.txt 是什么**：一种新兴标准，让网站声明其支持的 AI 模型、能力端点、交互协议。类似 robots.txt 但用于 AI 集成。

**获取前的思考**：

- 这个网站是否有 AI 相关服务？（有 API 文档 ≠ 有 llms.txt）
- 用户真正需要的是什么？（可能是 API 文档而非 llms.txt）
- 如果 llms.txt 不存在，备选方案是什么？

---

## 获取策略 — 决策树

```
用户请求获取 llms.txt
         │
         ▼
┌─────────────────────┐
│ 用户是否指定了域名？ │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
   是            否
    │             │
    ▼             ▼
使用指定域名   使用默认域名
                (llmstxt.org)
    │
    ▼
┌─────────────────────────────────┐
│ 按优先级尝试以下位置（依次）：    │
│ 1. https://<domain>/llms.txt    │
│ 2. https://<domain>/.well-known/llms.txt │
│ 3. https://www.<domain>/llms.txt │
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

**标准字段识别**：

| 字段           | 说明               | 示例                                    |
| -------------- | ------------------ | --------------------------------------- |
| `models`       | 支持的 AI 模型列表 | `models: claude-sonnet-4-6, gpt-4o`     |
| `endpoints`    | API 端点           | `endpoints: https://api.example.com/v1` |
| `capabilities` | 功能列表           | `capabilities: chat, vision, tools`     |
| `auth`         | 认证方式           | `auth: bearer, api-key`                 |
| `rate_limits`  | 速率限制           | `rate_limits: 100/min`                  |
| `docs`         | 相关文档链接       | `docs: https://example.com/ai-docs`     |

---

## NEVER 列表（反模式）

```markdown
NEVER 假设获取到的就是有效的 llms.txt：

- 可能返回 HTML 错误页面（检查是否包含 <html>、<!DOCTYPE>）
- 可能是重定向到登录页
- 可能是默认 404 页面

NEVER 不验证就展示给用户：

- 先检查内容是否包含预期字段
- 如果看起来像 HTML，告知用户"可能不是有效文档"

NEVER 只尝试一次就放弃：

- /llms.txt 失败 → 尝试 /.well-known/llms.txt
- 仍失败 → 尝试加 www 前缀
- 都失败 → 明确告知用户"该网站未提供 llms.txt"

NEVER 混淆 llms.txt 与：

- API 文档（通常是 /docs 或 /api/docs）
- OpenAPI/Swagger 规范（/openapi.json）
- robots.txt（用于爬虫，不是 AI）
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
