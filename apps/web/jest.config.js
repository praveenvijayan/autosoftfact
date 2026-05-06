const nextJest = require("next/jest");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/e2e/",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@paraymd/utils$":
      "<rootDir>/../../packages/utils/src/index.ts",
    "^@paraymd/types$":
      "<rootDir>/../../packages/types/src/index.ts",
    "^@paraymd/api-client$":
      "<rootDir>/../../packages/api-client/src/index.ts",
    "^@paraymd/db$":
      "<rootDir>/../../packages/db/src/index.ts",
  },
  collectCoverageFrom: [
    "app/**/*.{ts,tsx}",
    "components/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!app/layout.tsx",
    "!app/providers.tsx",
    "!app/globals.css",
  ],
};

module.exports = createJestConfig(config);
