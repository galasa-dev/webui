/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor, within } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';
import TestRunsTable from '@/components/test-runs/TestRunsTable';

// Mock the useRouter hook from Next.js to return a mock router object.
const mockRouter = {
  push: jest.fn(),
};

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, vars?: Record<string, any>) => {
    const translations: Record<string, string> = {
      "timeFrameText.range": "Showing test runs submitted between Jan 1 and Jan 10",
      "pagination.forwardText": "Next page",
    };

    let text = translations[key] || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  },
}));


jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock('@/app/error/page', () =>
  function MockErrorPage() {
    return <div data-testid="error-page">Error Occurred</div>;
  }
);

// Helper function to generate mock test runs data
const generateMockRuns = (count: number) => {
  return Array.from({length: count}, (_, index) => ({
    runId: `${index + 1}`,
    testStructure: {
      runName: `Test Run ${index + 1}`,
      requestor: `user${index + 1}`,
      group: `group${index + 1}`,
      bundle: `bundle${index + 1}`,
      package: `package${index + 1}`,
      testName: `test${index + 1}`,
      testShortName: `testShort${index + 1}`,
      status: "finished",
      result: index % 2 === 0 ? "Passed" : "Failed",
      submittedAt: new Date(Date.now() - index * 1000 * 60 * 60).toISOString(),
    },
  }));
};


describe('TestRunsTable Component', () => {
  beforeEach(() => {
    mockRouter.push.mockClear();
    // Suppress console.error for rejected promise tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering Logic', () => {
    test('shows loading state initially, then displays data when promise resolves', async() => {
      // Arrange
      const mockRuns = generateMockRuns(2);
      const mockPromise = Promise.resolve(mockRuns);

      // Act
      render(<TestRunsTable runsListPromise={mockPromise}/>);

      // Assert: Check if the loading state is displayed
      expect(screen.getByTestId('loading-table-skeleton')).toBeInTheDocument();
      expect(screen.queryByText('Test Run 1')).not.toBeInTheDocument();

      expect(await screen.findByText('Test Run 1')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-table-skeleton')).not.toBeInTheDocument();
      expect(screen.getByText('Test Run 2')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText(/Showing test runs submitted between/i)).toBeInTheDocument();
    });
  });

  test('display an error component when an empty array is passed', async () => {
    // Arrange
    const runsPromise = Promise.resolve([]);
  
    // Act
    render(<TestRunsTable runsListPromise={runsPromise} />);

    // Assert: Check if the error state is displayed
    expect(await screen.findByText(/No test runs found/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('TestRunsTable Interactions', () => {
  test('navigates to run details when a run is clicked', async () => {
    // Arrange
    const mockRuns = generateMockRuns(1);
    const runsPromise = Promise.resolve(mockRuns);
    render(<TestRunsTable runsListPromise={runsPromise} />);
    const tableRow = await screen.findByText('Test Run 1');

    // Act
    fireEvent.click(tableRow);

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/test-runs/1');
  });


  test('handles pagination changes correctly', async () => {
    // Arrange
    const mockRuns = generateMockRuns(15);
    const runsPromise = Promise.resolve(mockRuns);
    render(<TestRunsTable runsListPromise={runsPromise} />);
    
    // Wait for the table to finish loading
    const table = await screen.findByRole('table');
    
    // Assert initial state
    expect(within(table).getAllByRole('row')).toHaveLength(11); // 1 header + 10 data
    expect(screen.queryByText('Test Run 11')).not.toBeInTheDocument();

    // Act
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    // Assert final state
    await waitFor(() => {
      expect(screen.getByText('Test Run 11')).toBeInTheDocument();
    });
    expect(screen.queryByText('Test Run 1')).not.toBeInTheDocument();
  });
});