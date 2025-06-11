/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import TestRunsPage from '@/app/test-runs/page';
import { fetchAllTestRunsForLastDay } from '@/actions/getTestRuns';
import { Run } from '@/generated/galasaapi';
import { Suspense } from 'react';

jest.mock('@/actions/getTestRuns');
const mockedFetch = fetchAllTestRunsForLastDay as jest.Mock;

jest.mock('@/components/test-runs/TestRunsTabs', () => {
  return jest.fn(({ runs }: { runs: Run[] }) => (
    <div data-testid="test-runs-tabs">
      <span>Received {runs.length} runs</span>
    </div>
  ));
});

// Mock component dependencies
jest.mock('@/components/PageTile', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div data-testid="page-tile">{title}</div>,
}));

jest.mock('@/components/common/BreadCrumb', () => ({
  __esModule: true,
  default: () => <div data-testid="breadcrumb">BreadCrumb</div>,
}));

describe('TestRunsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });


  test('renders a loading state and calls the fetch action', async () => {
    // Arrange: Create a promise that will be resolved later.
    let resolvePromise: (value: Run[]) => void;
    const mockPromise = new Promise<Run[]>((resolve) => {
      resolvePromise = resolve;
    });
    mockedFetch.mockReturnValue(mockPromise);

    let page: JSX.Element;
    const pagePromise = TestRunsPage().then(p => { page = p; });

    // Resolve the promise
    const mockRuns = [{ runId: '1' }, { runId: '2' }];

    await act(async () => {
      resolvePromise(mockRuns as Run[]);
      await pagePromise; 
    });
    
    render(page);

    // Assert: Check the final, resolved state.
    const testRunsTabs = screen.getByTestId('test-runs-tabs');
    expect(testRunsTabs).toBeInTheDocument();
    expect(testRunsTabs).toHaveTextContent('Received 2 runs');
    expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    expect(mockedFetch).toHaveBeenCalledTimes(1);
  });

  test('renders the final content after data is successfully fetched', async () => {
    // Arrangd
    const mockRuns = [{runId: '1'}, {runId: '2'}];
    mockedFetch.mockResolvedValue(mockRuns as Run[]);

    // Act
    const page = await TestRunsPage();
    render(page);

    // Check for the main content container
    await waitFor(() => {
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();

      const testRunsTabs = screen.getByTestId('test-runs-tabs');
      expect(testRunsTabs).toBeInTheDocument();

      expect(testRunsTabs).toHaveTextContent('Received 2 runs');
      expect(mockedFetch).toHaveBeenCalledTimes(1);
    });
  });

  test('renders the main content structure', async () => {
    const mockRuns = [{runId: '1'}, {runId: '2'}];
    mockedFetch.mockResolvedValue(mockRuns as Run[]);

    // Act
    const page = await TestRunsPage();
    render(page);

    // Assert
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('page-tile')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });
});