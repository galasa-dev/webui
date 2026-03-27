/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import 'isomorphic-fetch';
// Add snapshot serializer for readable React component snapshots
// This converts React elements to a readable JSX-like format instead of verbose object notation
// Compatible with React 19 and Next.js 16
expect.addSnapshotSerializer({
  test: (val) => val && val.$$typeof === Symbol.for('react.transitional.element'),
  serialize: (val: any, config, indentation, depth, refs, printer) => {
    // Convert React element to a more readable format
    const { type, props } = val;
    const typeName = typeof type === 'function' ? type.name || 'Component' : type;

    // Build a JSX-like representation
    let result = `<${typeName}`;

    // Add props
    if (props) {
      const { children, ...otherProps } = props;
      const propKeys = Object.keys(otherProps);

      if (propKeys.length > 0) {
        result += '\n';
        propKeys.forEach((key) => {
          const value = otherProps[key];
          const valueStr = printer(value, config, indentation + config.indent, depth, refs);
          result += `${indentation}${config.indent}${key}=${valueStr}\n`;
        });
        result += indentation;
      }

      if (children !== undefined && children !== null) {
        result += '>\n';
        const childrenStr = printer(children, config, indentation + config.indent, depth, refs);
        result += `${indentation}${config.indent}${childrenStr}\n`;
        result += `${indentation}</${typeName}>`;
      } else {
        result += ' />';
      }
    } else {
      result += ' />';
    }

    return result;
  },
});

// This is needed for Carbon Design System components that use scrollIntoView
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}

// Polyfill for HTMLElement.prototype.scrollTo.
if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.scrollTo) {
  HTMLElement.prototype.scrollTo = jest.fn();
}

// Polyfill for window.matchMedia which is not available in jsdom.
// This is needed for Carbon Design System components that use media queries.
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

// Polyfill for ResizeObserver which is not available in jsdom.
// This is needed for Carbon Design System components that observe element sizes.
if (typeof global.ResizeObserver === 'undefined') {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
}
