import { defineConfig } from "oxlint";

export default defineConfig({
  // ============================================
  // Monorepo 根配置 - 共享基线
  // ============================================

  // 规则分类 - 默认开启 correctness
  categories: {
    correctness: "error",
    perf: "warn",
    style: "warn",
    suspicious: "warn",
  },

  // 忽略模式
  ignorePatterns: [
    "**/.next/**",
    "**/build/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
    "**/out/**",
    "**/*.min.js",
    ".turbo/**",
  ],

  // 通用覆盖配置
  overrides: [
    {
      files: ["**/*.{ts,tsx}"],
      rules: {
        "typescript/no-explicit-any": "warn",
      },
    },
    {
      files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**/*"],
      rules: {
        "no-console": "off",
        "typescript/no-explicit-any": "off",
        "unicorn/prefer-node-protocol": "off",
      },
    },
    {
      files: ["**/*.config.{ts,js}"],
      rules: {
        "no-console": "off",
      },
    },
  ],

  // 默认插件（子配置可扩展）
  plugins: ["oxc", "typescript", "unicorn"],
});
