/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import '@testing-library/jest-dom';
import { describe, expect, test, beforeEach } from '@jest/globals';
import { getHeightOfHeaderAndFooter } from '@/utils/functions/getHeightOfHeaderAndFooter';

describe('getHeightOfHeaderAndFooter', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
  });

  test('should return 0 when no elements with specified classes exist', () => {
    // Given...
    // Empty document body

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(0);
  });

  test('should return the height of a single element with class "toolbar"', () => {
    // Given...
    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'toolbar';
    Object.defineProperty(toolbarElement, 'offsetHeight', {
      configurable: true,
      value: 64,
    });
    document.body.appendChild(toolbarElement);

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(64);
  });

  test('should accumulate heights from multiple different class elements', () => {
    // Given...
    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'toolbar';
    Object.defineProperty(toolbarElement, 'offsetHeight', {
      configurable: true,
      value: 64,
    });

    const crumbElement = document.createElement('div');
    crumbElement.className = 'crumbContainer';
    Object.defineProperty(crumbElement, 'offsetHeight', {
      configurable: true,
      value: 48,
    });

    const headerElement = document.createElement('div');
    headerElement.className = 'cds--header__global';
    Object.defineProperty(headerElement, 'offsetHeight', {
      configurable: true,
      value: 48,
    });

    const footerElement = document.createElement('div');
    footerElement.className = 'footer';
    Object.defineProperty(footerElement, 'offsetHeight', {
      configurable: true,
      value: 80,
    });

    document.body.appendChild(toolbarElement);
    document.body.appendChild(crumbElement);
    document.body.appendChild(headerElement);
    document.body.appendChild(footerElement);

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(240); // 64 + 48 + 48 + 80
  });

  test('should accumulate heights from multiple elements with the same class', () => {
    // Given...
    const toolbar1 = document.createElement('div');
    toolbar1.className = 'toolbar';
    Object.defineProperty(toolbar1, 'offsetHeight', {
      configurable: true,
      value: 64,
    });

    const toolbar2 = document.createElement('div');
    toolbar2.className = 'toolbar';
    Object.defineProperty(toolbar2, 'offsetHeight', {
      configurable: true,
      value: 32,
    });

    document.body.appendChild(toolbar1);
    document.body.appendChild(toolbar2);

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(96); // 64 + 32
  });

  test('should handle elements with zero height', () => {
    // Given...
    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'toolbar';
    Object.defineProperty(toolbarElement, 'offsetHeight', {
      configurable: true,
      value: 0,
    });

    const footerElement = document.createElement('div');
    footerElement.className = 'footer';
    Object.defineProperty(footerElement, 'offsetHeight', {
      configurable: true,
      value: 80,
    });

    document.body.appendChild(toolbarElement);
    document.body.appendChild(footerElement);

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(80); // 0 + 80
  });

  test('should only count elements with exact class names', () => {
    // Given...
    const toolbarElement = document.createElement('div');
    toolbarElement.className = 'toolbar';
    Object.defineProperty(toolbarElement, 'offsetHeight', {
      configurable: true,
      value: 64,
    });

    const notToolbarElement = document.createElement('div');
    notToolbarElement.className = 'toolbar-extra';
    Object.defineProperty(notToolbarElement, 'offsetHeight', {
      configurable: true,
      value: 100,
    });

    document.body.appendChild(toolbarElement);
    document.body.appendChild(notToolbarElement);

    // When...
    const totalHeight = getHeightOfHeaderAndFooter();

    // Then...
    expect(totalHeight).toBe(64); // Only the exact 'toolbar' class
  });
});
