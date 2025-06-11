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
    mockRouter.push.mockClear();
  });

  describe('Rendering Logic', () => {
    test('displays test runs after data is fetched', async() => {
      // Arrange
      const mockRuns = generateMockRuns(2);
      // Act
      render(<TestRunsTable rawRuns={mockRuns}/>);

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

  test('display error page when an empty array is passed', async () => {
    // Arrange
    render(<TestRunsTable rawRuns={[]}/>);

    // Assert: Check if the error state is displayed
    expect(await screen.findByText(/No test runs found/i)).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('renders a row with "N/A" when testStructure is missing or incomplete', () => {
    // ARRANGE: Pass a run with null testStructure.
    const mockRuns = [{ runId: '1' }];
    render(<TestRunsTable rawRuns={mockRuns} />);

    // ASSERT
    const row = screen.getByRole('row', { name: /N\/A/i });
    const cells = within(row).getAllByRole('cell');
    
    expect(cells[0]).toHaveTextContent('N/A'); // Submitted At
    expect(cells[1]).toHaveTextContent('N/A'); // Test Run Name
    expect(cells[2]).toHaveTextContent('N/A'); // Requestor
  });
});

describe('TestRunsTable Interactions', () => {
  test('navigates to run details when a run is clicked', async () => {
    // Arrange
    const mockRuns = generateMockRuns(1);
    render(<TestRunsTable rawRuns={mockRuns}/>);

    // Act
    const firstRunRow = screen.getByText('Test Run 1');
    fireEvent.click(firstRunRow);

    // Assert: Check if the router push was called with the correct runId
    expect(mockRouter.push).toHaveBeenCalledWith('/test-runs/1');
    expect(mockRouter.push).toHaveBeenCalledTimes(1);
  });

  test('handles paginatioon changes correctly', async () => {
    // Arrange
    const mockRuns = generateMockRuns(15);
    render(<TestRunsTable rawRuns={mockRuns} />);

    // Act: render the table
    const table = screen.getByRole('table');

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
});