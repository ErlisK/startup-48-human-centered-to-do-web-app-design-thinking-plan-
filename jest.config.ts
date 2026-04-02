import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }] },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testMatch: [
    "**/__tests__/unit/**/*.test.{ts,tsx}",
    "**/__tests__/integration/**/*.test.{ts,tsx}",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  collectCoverageFrom: ["components/**/*.tsx", "lib/**/*.ts", "hooks/**/*.ts", "app/api/**/*.ts"],
  coverageThreshold: { global: { branches: 55, functions: 65, lines: 65 } },
};
export default config;
