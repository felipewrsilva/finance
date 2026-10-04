import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "prisma/**",
    "scripts/**",
    "src/modules/**",
    "src/lib/prisma.ts",
    "src/lib/exchange-rates.ts",
    "src/lib/tesouro-rates.ts",
    "src/lib/chart-config.ts",
    "src/lib/personal-features.ts",
    "src/components/accounts/**",
    "src/components/budgets/**",
    "src/components/investments/**",
    "src/components/reports/**",
    "src/components/settings/**",
    "src/components/transactions/**",
    "src/components/ui/**",
  ]),
]);

export default eslintConfig;
