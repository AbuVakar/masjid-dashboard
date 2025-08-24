module.exports = {
  testEnvironment: 'node',
  // Look for test files in the __tests__ directory relative to this config file
  testMatch: ['**/__tests__/**/*.test.js'],
  // The root of the source code, relative to this file
  rootDir: '.',
  // Setup file for database connection etc.
  setupFilesAfterEnv: ['<rootDir>/test-setup.js'],
  // Test timeout
  testTimeout: 30000,
  // Clear mocks
  clearMocks: true,
};
