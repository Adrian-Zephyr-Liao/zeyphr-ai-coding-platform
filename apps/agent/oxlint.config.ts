import { defineConfig } from "oxlint";

export default defineConfig({
  // Agent 应用 (Node.js) 专用配置
  // 注意：Oxlint 会自动使用最近目录的配置文件（嵌套配置）

  // 环境配置
  env: {
    browser: false,
    node: true,
  },

  // 额外插件（Agent 专用）
  plugins: ["import", "promise"],

  // Agent 专用规则
  rules: {
    "no-console": "off",
    "no-debugger": "error",
    "no-unused-vars": "error",

    // Import 规则
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/no-unresolved": "off",
    "import/no-unused-modules": "error",

    // TypeScript - 后端对 any 更宽容
    "typescript/no-explicit-any": "off",
    "typescript/no-namespace": "error",
    "typescript/no-unused-expressions": "error",

    // Unicorn
    "unicorn/prefer-node-protocol": "warn",
    "unicorn/prefer-string-slice": "warn",

    // OXC
    "oxc/approx-constant": "warn",
    "oxc/no-barrel-file": "off",

    // Promise 异步编程
    "promise/always-return": "warn",
    "promise/no-callback-in-promise": "warn",

    // 禁用规则
    "eslint/capitalized-comments": "off",
    "eslint/sort-keys": "off",
  },
});
