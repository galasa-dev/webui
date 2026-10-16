/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

// The Jest configuration to use in this project - see https://jestjs.io/docs/configuration for more information
const config = {
  setupFilesAfterEnv: ['<rootDir>/setupTests.ts'],
  testEnvironment: './extendedJsdomEnvironment.ts',

  // Ignore auto-generated code in coverage reports
  coveragePathIgnorePatterns: ['<rootDir>/src/generated/'],

  // Map module path aliases (i.e. imports starting with '@', like '@/my/ts/file' ) to absolute paths
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },

  // Required for testing the image renderer
  setupFiles: ['jest-canvas-mock'],
};

// next/jest always prepends its own "ignore everything in node_modules" pattern and only allows
// custom patterns to be appended, so a custom allowlist set in the config above has no effect.
// Override the patterns after next/jest has resolved the config so that ES module dependencies
// (e.g. temporal-polyfill and its dependencies, used by @carbon/utilities) are transformed to CommonJS.
module.exports = async () => {
  const jestConfig = await createJestConfig(config)();

  jestConfig.transformIgnorePatterns = [
    '/node_modules/(?!(next-intl|@carbon|temporal-polyfill|temporal-utils|temporal-spec)/)',
    '^.+\\.module\\.(css|sass|scss)$',
  ];

  return jestConfig;
};
