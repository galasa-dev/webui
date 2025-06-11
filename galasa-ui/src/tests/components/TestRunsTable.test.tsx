/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import '@testing-library/jest-dom';

// Mock Carbon's Loading component to render a simple div.
jest.mock('@carbon/react', () => {
  const originalModule = jest.requireActual('@carbon/react');
  return {
    __esModule: true,
    ...originalModule,
    Loading: () => <div data-testid="loading">Loading...</div>
  };
});
