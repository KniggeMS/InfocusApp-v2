const baseConfig = require('@infocus/jest-config/node');

module.exports = {
  ...baseConfig,
  displayName: 'shared',
  rootDir: __dirname,
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/__tests__/**'],
};
