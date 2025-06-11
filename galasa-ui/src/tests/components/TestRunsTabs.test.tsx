/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import TestRunsTabs from '@/components/test-runs/TestRunsTabs';

// Mock the TestRunsTable component to avoid making actual API calls
jest.mock('@/components/test-runs/TestRunsTable', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="test-runs-table">Mocked Test Runs Table</div>,
  };
});

// Mock window.matchMedia to prevent errors in the JSDOM test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('TestRunsTabs Component', () => {
  test('renders all tabs correctly', () => {
    render(<TestRunsTabs />);

    const tabLabels = ['Timeframe', 'Table Design', 'Search Criteria', 'Results'];
    tabLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('displays the content of the Timeframe tab', () => {
    render(<TestRunsTabs />);

    fireEvent.click(screen.getByText('Timeframe'));
    expect(screen.getByText(/Currently, all results for the last 24 hours/i)).toBeInTheDocument();
  });

  test('switches to the "Results" tab and displays its content on click', async () => {
    // Arrange
    render(<TestRunsTabs />);

    // Act: Click on the 'Results' tab
    const resultsTab = screen.getByRole('tab', { name: 'Results' });
    fireEvent.click(resultsTab);

    // Assert: Check that the 'Results' tab is now active
    expect(resultsTab).toHaveAttribute('aria-selected', 'true');
    const timeframeTab = screen.getByRole('tab', { name: 'Timeframe' });
    expect(timeframeTab).toHaveAttribute('aria-selected', 'false');

    // Assert: The content of the 'Results' tab should be visible.
    expect(screen.getByTestId('test-runs-table')).toBeVisible();
    expect(screen.getByText('Mocked Test Runs Table')).toBeVisible();
  });

});