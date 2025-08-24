module.exports = {
  // Test environment - use node for backend tests, jsdom for frontend
  testEnvironment: 'node',

  // Add the server's node_modules to the search path
  moduleDirectories: ['node_modules', '<rootDir>/server/node_modules'],

  // Test file patterns for backend
  testMatch: ['**/server/__tests__/**/*.test.js'],

  // Coverage configuration for backend
  collectCoverageFrom: [
    'server/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/build/**',
    '!**/dist/**',
    '!**/*.config.js',
    '!server/server.js',
  ],

  coverageDirectory: 'coverage/backend',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Setup files for backend
  setupFilesAfterEnv: ['<rootDir>/server/test-setup.js'],

  // Tell Jest where to look for modules, especially for the server tests
  modulePaths: ['<rootDir>', '<rootDir>/server'],

  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
  },

  // Transform configuration
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },

  // Test timeout
  testTimeout: 30000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true,

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],

  // Ignore patterns
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/build/', '/dist/'],

  // Collect coverage from specific files
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'server/**/*.js',
    '!src/index.js',
    '!src/App.js',
    '!server/server.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/*.config.js',
    '!**/setup.js',
  ],

  // Coverage thresholds for backend
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './server/': {
      branches: 75,
      functions: 75,
      lines: 75,
      statements: 75,
    },
  },
};
