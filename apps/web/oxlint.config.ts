import { defineConfig } from "oxlint";

export default defineConfig({
  // Web 应用 (Next.js) 专用配置
  // 注意：Oxlint 会自动使用最近目录的配置文件（嵌套配置）

  // 环境配置
  env: {
    browser: true,
    node: true,
  },

  // 额外插件（Web 专用）
  plugins: ["import", "jsx-a11y", "nextjs", "react"],

  // Web 专用规则
  rules: {
    "no-console": "off",
    "no-debugger": "error",
    "no-unused-vars": "error",

    // Import 规则
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/no-named-export": "off",
    "import/no-unused-modules": "error",

    // React Hooks
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error",

    // React JSX
    "jsx-max-depth": "off",
    "react-in-jsx-scope": "off",
    "react/jsx-key": "error",
    "react/jsx-no-comment-textnodes": "error",
    "react/jsx-no-target-blank": "error",
    "react/no-array-index-key": "warn",
    "react/no-unescaped-entities": "warn",

    // TypeScript
    "typescript/no-explicit-any": "warn",
    "typescript/no-namespace": "error",
    "typescript/no-unused-expressions": "error",

    // Unicorn
    "unicorn/prefer-node-protocol": "warn",
    "unicorn/prefer-string-slice": "warn",

    // OXC
    "oxc/approx-constant": "warn",
    "oxc/no-barrel-file": "off",

    // 禁用规则
    "eslint/capitalized-comments": "off",
    "eslint/sort-keys": "off",
  },

  // React 相关设置
  settings: {
    next: {
      rootDir: ".",
    },
    react: {
      version: "19.2",
    },
    "jsx-a11y": {
      components: {
        Link: "a",
        Button: "button",
      },
    },
  },
});
