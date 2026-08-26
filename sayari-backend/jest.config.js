'use strict';
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/tests/**/*.test.js'],
  testTimeout: 30000,
  verbose: true,
  forceExit: true,
  transformIgnorePatterns: ['node_modules/(?!(uuid)/)'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/modules/**/*.js','src/utils/**/*.js','!src/tests/**'],
};
