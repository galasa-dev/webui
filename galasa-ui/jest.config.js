/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
module.exports = {
	setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
	testEnvironment: "jest-environment-jsdom",
	transform: {
		"^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
	},
  transformIgnorePatterns: [
    "node_modules/(?!jose)"
  ],
  moduleDirectories: ['node_modules', '<rootDir>/src'],
  moduleNameMapper: {
    "@/(.*)": "<rootDir>/src/$1"
  }
};