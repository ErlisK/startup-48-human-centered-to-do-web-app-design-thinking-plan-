import type { Config } from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  transform: { "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: { jsx: "react-jsx" } }] },
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}", "**/e2e/**/*.spec.{ts,tsx}"],
  collectCoverageFrom: ["components/**/*.tsx", "lib/**/*.ts", "hooks/**/*.ts"],
  coverageThreshold: { global: { branches: 60, functions: 70, lines: 70 } },
};
export default config;
