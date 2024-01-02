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
	setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
	testEnvironment: "jest-environment-jsdom",

  // Ignore auto-generated code in coverage reports
  coveragePathIgnorePatterns: [
    "<rootDir>/src/generated/"
  ],

  // Map module path aliases (i.e. imports starting with '@', like '@/my/ts/file' ) to absolute paths
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1"
  }
};

module.exports = createJestConfig(config);
