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
import { fetchMyTestRunsForLastDay } from '@/actions/getTestRuns';

// Mock Carbon's Loading component to render a simple div.
jest.mock('@carbon/react', () => {
  const originalModule = jest.requireActual('@carbon/react');
  return {
    __esModule: true,
    ...originalModule,
    Loading: () => <div data-testid="loading">Loading...</div>
  };
});

// Mock the server action to return a resolved promise with test run data.
jest.mock('@/actions/getTestRuns');

// Mock the useRouter hook from Next.js to return a mock router object.
const mockRouter = {
  push: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));

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
      status: 'finished',
      result: index % 2 === 0 ? 'Passed' : 'Failed',
      submittedAt: new Date(Date.now() - (index * 1000 * 60 * 60)).toISOString()
    },
  }));
};


describe('TestRunsTable Component', () => {
  // Clear mock history before each test
  beforeEach(()=> {
    (fetchMyTestRunsForLastDay as jest.Mock).mockClear();
    mockRouter.push.mockClear();
  });

  describe('State Transitions and Data Fetching', () => {
    test('renders loading state initially and calls the fetchMyTestRunsForLastDay action', () => {
      // Arrange: Set up a pending promise to keep it in the loading state
      (fetchMyTestRunsForLastDay as jest.Mock).mockReturnValue(new Promise(() => {}));

      // Act
      render(<TestRunsTable />);

      // Assert: Check if the loading state is rendered and the action is called only one time
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(fetchMyTestRunsForLastDay).toHaveBeenCalledTimes(1);
    }
    );

    test('displays test runs after data is fetched', async() => {
      // Arrange
      const mockRuns = generateMockRuns(2);

      (fetchMyTestRunsForLastDay as jest.Mock).mockResolvedValue(mockRuns);

      // Act
      render(<TestRunsTable />);

      // Assert
      await waitFor(() => {
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
      });

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Test Run 1')).toBeInTheDocument();
      expect(screen.getByText('Test Run 2')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('user2')).toBeInTheDocument();
      expect(screen.getByText(/Showing test runs submitted between/i)).toBeInTheDocument();
    });
  });

  test('display error page when fetching runs fails', async () => {
    // Arrange: Mock the action to throw an error
    (fetchMyTestRunsForLastDay as jest.Mock).mockRejectedValue(new Error('Failed to fetch runs'));

    // Act
    render(<TestRunsTable />);

    // Assert: Check if the error state is displayed
    expect(await screen.findByText('Something went wrong!')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('display a no runs message when no runs are available', async () => {
    // Arrange: Mock the action to return an empty array
    (fetchMyTestRunsForLastDay as jest.Mock).mockResolvedValue([]);

    // Act
    render(<TestRunsTable />);

    // Assert: Check if the no runs message is displayed
    expect(await screen.findByText(/No test runs found/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });
});

describe('TestRunsTable Interactions', () => {
  test('navigates to run details when a run is clicked', async () => {
    // Arrange
    const mockRuns = generateMockRuns(1);
    (fetchMyTestRunsForLastDay as jest.Mock).mockResolvedValue(mockRuns);

    // Act
    render(<TestRunsTable />);

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
    });

    const firstRunRow = screen.getByText('Test Run 1');
    fireEvent.click(firstRunRow);

    // Assert: Check if the router push was called with the correct runId
    expect(mockRouter.push).toHaveBeenCalledWith('/test-runs/1');
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  test('handles paginatioon changes correctly', async () => {
    // Arrange
    const mockRuns = generateMockRuns(15);
    (fetchMyTestRunsForLastDay as jest.Mock).mockResolvedValue(mockRuns);

    // Act: render the table
    render(<TestRunsTable />);
    const table = await screen.findByRole('table');

    // Assert: Expect only 10 rows to be displayed initially and test run 11 are not in the document
    expect(within(table).getAllByRole('row')).toHaveLength(11); // 10 data rows + 1 header row
    expect(screen.queryByText('Test Run 11')).not.toBeInTheDocument();

    // Act: click the next page button
    const nextPageButton = screen.getByRole('button', { name: /next page/i });
    fireEvent.click(nextPageButton);

    // Assert: Expect the next 5 rows to be displayed
    await waitFor(() => {
      expect(within(table).getByText('Test Run 11')).toBeInTheDocument();
    });
    expect(within(table).queryByText('Test Run 1')).not.toBeInTheDocument();
    expect(within(table).getAllByRole('row')).toHaveLength(6); // 5 data rows + 1 header row
  });

  test('renders a row with N/A when testStructure is missing', async () => {
    // Arrange: Mock the action to return runs with missing testStructure
    const mockRuns = [
      {
        runId: '1',
        testStructure: null, 
      },
    ];
    (fetchMyTestRunsForLastDay as jest.Mock).mockResolvedValue(mockRuns);

    // Act
    render(<TestRunsTable />);

    // Assert
    const table = await screen.findByRole('table');
    const row = await screen.findByRole('row', { name: /N\/A/i }); // Find a row where one cell has N/A
    const cells = within(row).getAllByRole('cell');

    // Check that all relevant cells defaulted to 'N/A'
    expect(cells[0]).toHaveTextContent('N/A'); // Submitted At
    expect(cells[1]).toHaveTextContent('N/A'); // Test Run Name
    expect(cells[2]).toHaveTextContent('N/A'); // Requestor
  }
  );
    
});