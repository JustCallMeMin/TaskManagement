module.exports = {
  // The root of your source code, typically /src
  roots: ["<rootDir>/src"],

  // Add jest-dom matchers
  setupFilesAfterEnv: ["@testing-library/jest-dom"],

  // Map axios to our mock implementation
  moduleNameMapper: {
    "^axios$": "<rootDir>/src/tests/mocks/axios.js"
  },

  // Transform ES modules
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },

  // Configure test environment
  testEnvironment: "jsdom",

  // Allow any imports from node_modules except axios
  transformIgnorePatterns: [
    "/node_modules/(?!axios).+\\.js$"
  ],

  // Collect coverage information
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts"
  ],

  // Run tests in watch mode by default
  watchPlugins: [
    "jest-watch-typeahead/filename",
    "jest-watch-typeahead/testname"
  ]
}; 