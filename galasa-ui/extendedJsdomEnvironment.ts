/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import JSDOMEnvironment from 'jest-environment-jsdom';

/**
 * An extension of the JSDOM environment created to fix issues with resolving
 * global functions in unit tests.
 */
export default class ExtendedJSDOMEnvironment extends JSDOMEnvironment {
  constructor(...args: ConstructorParameters<typeof JSDOMEnvironment>) {
    super(...args);

    // structuredClone() was added in Node 17 but a "ReferenceError: structuredClone is not defined"
    // error is thrown when running tests - see https://github.com/jsdom/jsdom/issues/3363
    // This line forces the unit tests to use the correct implementation of structuredClone()
    this.global.structuredClone = structuredClone;
  }
}
