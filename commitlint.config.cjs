/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  prompt: {
    alias: { fd: "docs: fix typos" },
    allowBreakingChanges: ["feat", "fix"],
    allowCustomScopes: true,
    breaklineChar: "|",
    emojiAlign: "center",
    issuePrefixes: [{ name: "closed:   ISSUES has been processed", value: "closed" }],
    types: [
      { emoji: ":sparkles:", name: "feat:     ✨  A new feature", value: "feat" },
      { emoji: ":bug:", name: "fix:      🐛  A bug fix", value: "fix" },
      { emoji: ":books:", name: "docs:     📚  Documentation only changes", value: "docs" },
      {
        emoji: ":gem:",
        name: "style:    💎  Changes that do not affect the meaning of the code",
        value: "style",
      },
      {
        emoji: ":hammer:",
        name: "refactor: 🔨  A code change that neither fixes a bug nor adds a feature",
        value: "refactor",
      },
      {
        emoji: ":rocket:",
        name: "perf:     🚀  A code change that improves performance",
        value: "perf",
      },
      {
        emoji: ":rotating_light:",
        name: "test:     🚨  Adding missing tests or correcting existing tests",
        value: "test",
      },
      {
        emoji: ":package:",
        name: "build:    📦  Changes that affect the build system or external dependencies",
        value: "build",
      },
      {
        emoji: ":construction_worker:",
        name: "ci:       👷  Changes to our CI configuration files and scripts",
        value: "ci",
      },
      {
        emoji: ":wrench:",
        name: "chore:    🔧  Other changes that don't modify src or test files",
        value: "chore",
      },
    ],
    useEmoji: true,
  },
  rules: {
    // 允许 empty subject
    "subject-empty": [0],
  },
};
