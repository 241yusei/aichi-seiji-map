// Next.js 16 の eslint-config-next はネイティブ Flat Config（Linter.Config[]）を提供する。
// サブパスを直接スプレッドする（FlatCompat は使わない）。
import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      // CLAUDE.md の規約: CommonJS（require）は使わない。
      "@typescript-eslint/no-require-imports": "error",
      // 先頭が _ の引数・変数は「意図的に未使用」として許可（IF準拠のスタブ等）。
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "data/**",
      "next-env.d.ts",
      // エージェントの一時worktree（自動生成・lint対象外）
      ".claude/**",
    ],
  },
];

export default eslintConfig;
