module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  clearMocks: true,
  globalSetup: "<rootDir>/tests/setup-env.ts",
  globalTeardown: "<rootDir>/tests/prisma-teardown.ts",
  testTimeout: 15000, // 15 seconds for database operations
  maxWorkers: 1, // Run tests serially to avoid database conflicts
};
