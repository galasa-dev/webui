/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import TestRunsTabs from '@/components/test-runs/TestRunsTabs';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { stat } from 'fs';

// Mock Child Components
const TestRunsTableMock = jest.fn((props) =>
  <div>
    <div data-testid="test-runs-table">
    Mocked Test Runs Table
    </div>
    {
      props.runsList.forEach((run: any) => {
        const runId = run.id;
        return <div key={runId}>{run.runName || runId}</div>;
      })
    }
  </div>);
jest.mock('@/components/test-runs/TestRunsTable', () => ({
  __esModule: true,
  default: (props: any) => TestRunsTableMock(props),
}));

jest.mock('@/components/test-runs/TimeFrameContent', () => ({
  __esModule: true,
  default: () => <div>Mocked Timeframe Content</div>,
}));

jest.mock('@/components/test-runs/SearchCriteriaContent', () => ({
  __esModule: true,
  default: () => <div>Mocked Search Criteria Content</div>,
}));

let capturedSetSelectedVisibleColumns: (columns: string[]) => void;
let capturedSetColumnsOrder: (order: { id: string; columnName: string }[]) => void;
let capturedSetSortOrder: (sortOrder: { id: string; order: 'asc' | 'desc' | 'none' }[]) => void;

jest.mock('@/components/test-runs/TableDesignContent', () => ({
  __esModule: true,
  default: (props: any) => {
    capturedSetSelectedVisibleColumns = props.setSelectedRowIds;
    capturedSetColumnsOrder = props.setTableRows;
    capturedSetSortOrder = props.setSortOrder;
    return <div>Mocked Table Design Content</div>;
  },
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "tabs.timeframe": "Timeframe",
      "tabs.tableDesign": "Table Design",
      "tabs.searchCriteria": "Search Criteria",
      "tabs.results": "Results",
    };
    return translations[key] || key;
  },
}));

const mockReplace = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: mockReplace,
  }),
  useSearchParams: () => mockUseSearchParams(),
  usePathname: () => '/',
}));

jest.mock('@/utils/constants/common', () => ({
  RESULTS_TABLE_COLUMNS:  [
    { id: 'submittedAt', columnName: 'Submitted' },
    { id: 'runName', columnName: 'Test Run Name' },
    { id: 'requestor', columnName: 'Requestor' },
    { id: 'testName', columnName: 'Test Name' },
    { id: 'status', columnName: 'Status' },
    { id: 'result', columnName: 'Result' },
    { id: 'tags', columnName: 'Tags' }
  ],
  COLUMNS_IDS: {
    SUBMITTED_AT: 'submittedAt',
    TEST_RUN_NAME: 'runName',
    REQUESTOR: 'requestor',
    TEST_NAME: 'testName',
    STATUS: 'status',
    RESULT: 'result',
    TAGS: 'tags',
  },  RUN_QUERY_PARAMS: {
    FROM: 'from',
    TO: 'to',
    RUN_NAME: 'runName',
    REQUESTOR: 'requestor',
    GROUP: 'group',
    SUBMISSION_ID: 'submissionId',
    BUNDLE: 'bundle',
    TEST_NAME: 'testName',
    RESULT: 'result',
    STATUS: 'status',
    TAGS: 'tags',
    VISIBLE_COLUMNS: 'visibleColumns',
    COLUMNS_ORDER: 'columnsOrder',
    TAB: 'tab',
    SORT_ORDER: 'sortOrder',
  }
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ runs: [], limitExceeded: false }),
  })
) as jest.Mock;


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Turn off retries for tests to make them run faster
      retry: false,
    }
  }
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);


describe('TestRunsTabs Component', () => {
  const mockRequestorNamesPromise = Promise.resolve([]);
  const mockResultsNamesPromise = Promise.resolve([]);

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Default to returning empty search params. Individual tests can override this.
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    // Clear the react-query cache 
    queryClient.clear();
  });

  test('renders all tabs correctly', () => {
    render(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
      , { wrapper }
    );
    const tabLabels = ['Timeframe', 'Table Design', 'Search Criteria', 'Results'];
    tabLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  test('displays the content of the Timeframe tab', () => {
    render(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />, {wrapper}
    );
    const timeframeTab = screen.getByRole('tab', { name: 'Timeframe' });
    fireEvent.click(timeframeTab);

    expect(timeframeTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Mocked Timeframe Content')).toBeVisible();
  });

  test('switches to the "Results" tab and displays its content on click', async () => {
    render(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />, {wrapper}
    );
    const resultsTab = screen.getByRole('tab', { name: 'Results' });
    fireEvent.click(resultsTab);

    expect(resultsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('test-runs-table')).toBeVisible();
  });

  describe('URL State Management', () => {
    test('loads state from URL parameters on initial render', async () => {
      // Arrange: Provide specific URL parameters for this test
      const params = new URLSearchParams();
      params.set('visibleColumns', 'status,result');
      params.set('columnsOrder', 'result,status,testName');
      mockUseSearchParams.mockReturnValue(params);
  
      // Act
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );
  
      // Assert: Wait for the component to process the params and pass them as props
      await waitFor(() => {
        expect(TestRunsTableMock).toHaveBeenCalledWith(expect.objectContaining({
          visibleColumns: ['status', 'result'],
          orderedHeaders: [
            { id: 'result', columnName: 'Result' },
            { id: 'status', columnName: 'Status' },
            { id: 'testName', columnName: 'Test Name' },
          ]
        }));
      });
    });

    test('saves default state to URL when no parameters are present', async () => {
      // Act
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );
  
      // Assert: Wait for the initialization and save effect to run
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledTimes(1);
      });
        
      const expectedParams = new URLSearchParams();
      const defaultVisible = "submittedAt,runName,requestor,testName,status,result";
      const defaultOrder = "submittedAt,runName,requestor,testName,status,result,tags";
      expectedParams.set('tab', 'timeframe');
      expectedParams.set('visibleColumns', defaultVisible);
      expectedParams.set('columnsOrder', defaultOrder);

      expect(mockReplace).toHaveBeenCalledWith(`/?${expectedParams.toString()}`, { scroll: false });
    });

    test('updates URL when selected visible columns are changed', async () => {
      // Arrange
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );

      // Wait for the initial save
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1)); 
      mockReplace.mockClear();
  
      // Act: Simulate a child component updating the state
      act(() => {
        capturedSetSelectedVisibleColumns(['status', 'result']);
      });
  
      // Assert: The save-to-URL effect runs again with the new state
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
  
      const urlCall = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(urlCall.split('?')[1]);
      expect(params.get('visibleColumns')).toBe('status,result');
      expect(params.get('columnsOrder')).toBe('submittedAt,runName,requestor,testName,status,result,tags');
    });

    test('updates URL when column order is changed', async () => {
      // Arrange
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );

      // Wait for the initial save
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1)); 
      mockReplace.mockClear();
  
      // Act: Simulate a child component updating the state
      const newOrder = [ { id: 'result', columnName: 'Result' }, { id: 'status', columnName: 'Status' }];
      act(() => {
        capturedSetColumnsOrder(newOrder);
      });
  
      // Assert
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
  
      const urlCall = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(urlCall.split('?')[1]);
      expect(params.get('columnsOrder')).toBe('result,status');
      expect(params.get('visibleColumns')).toBe('submittedAt,runName,requestor,testName,status,result');
    });

    test('clear visible columns in URL when none are selected', async () => {
      // Arrange
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );

      // Wait for the initial save
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1)); 
      mockReplace.mockClear();
  
      // Act: Simulate a child component clearing the visible columns
      act(() => {
        capturedSetSelectedVisibleColumns([]);
      });
  
      // Assert: The save-to-URL effect runs again with the new state
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
  
      const urlCall = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(urlCall.split('?')[1]);
      expect(params.get('visibleColumns')).toBeNull();
    });

    test('updates URL when sort order is changed', async () => {
      // Arrange
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );

      // Wait for the initial save
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1)); 
      mockReplace.mockClear();
  
      // Act: Simulate a child component updating the sort order
      act(() => {
        capturedSetSortOrder([{ id: 'status', order: 'asc' }, { id: 'result', order: 'desc' }]);
      });
  
      // Assert: The save-to-URL effect runs again with the new state
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
  
      const urlCall = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(urlCall.split('?')[1]);
      expect(params.get('sortOrder')).toBe('status:asc,result:desc');
    });

    test('clear sortOrder in URL when no certain order is specified', async () => {
      // Arrange
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        /> , { wrapper }
      );

      // Wait for the initial save
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1)); 
      mockReplace.mockClear();
  
      // Act: Simulate a child component clearing the visible columns
      act(() => {
        capturedSetSortOrder([]);
      });
  
      // Assert: The save-to-URL effect runs again with the new state
      await waitFor(() => expect(mockReplace).toHaveBeenCalledTimes(1));
  
      const urlCall = mockReplace.mock.calls[0][0];
      const params = new URLSearchParams(urlCall.split('?')[1]);
      expect(params.get('sortOrder')).toBeNull();
    });

    test('initialize sortOrder state from URL parameter', async() => {
      // Arrange: Provide specific URL parameters for this test
      const params = new URLSearchParams();
      params.set('sortOrder', 'status:asc,result:desc');
      mockUseSearchParams.mockReturnValue(params);
  
      // Act
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );
  
      // Assert: Wait for the component to process the params and pass them as props
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalled();
        const urlCall = mockReplace.mock.calls[0][0];
        const newParams = new URLSearchParams(urlCall.split('?')[1]);
        expect(newParams.get('sortOrder')).toBe('status:asc,result:desc');
      });
    });
  });

  describe('Data Fetching with useQuery', () => {
    beforeEach(() => {
      // Clear call history for fetch before each test
      (global.fetch as jest.Mock).mockClear();
      queryClient.clear();
    });

    test('does not fetch data on initial render if "Results" tab is not active', () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams());
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );

      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('fetches data when "Results" tab is selected', async () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams());
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );

      expect(global.fetch).not.toHaveBeenCalled();

      // Navigate to results tab
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    });

    test('serves data from cache and does not refetch when switching tabs with same query', async () => {
      mockUseSearchParams.mockReturnValue((new URLSearchParams("requestor=user1&result=passed")));
      render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );

      // Initial fetch 
      const resultsTab = screen.getByRole('tab', { name: 'Results' });
      fireEvent.click(resultsTab);
      await waitFor(() => expect(resultsTab).toHaveAttribute('aria-selected', 'true'));
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

      // Switch to another tab and back
      const timeFrameTab = screen.getByRole('tab', { name: 'Timeframe' });
      fireEvent.click(timeFrameTab);
      await waitFor(() => expect(timeFrameTab).toHaveAttribute('aria-selected', 'true'));

      fireEvent.click(resultsTab);
      await waitFor(() => expect(resultsTab).toHaveAttribute('aria-selected', 'true'));
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('does NOT trigger a new fetch when a UI-only param changes', async () => {
      mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed"));
      const {rerender} = render(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />, { wrapper }
      );

      // Initial fetch 
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));
      await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

      // Change a UI-only param (e.g., visibleColumns)
      mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed&visibleColumns=status,result"));
      rerender(
        <TestRunsTabs
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />
      );

      // Ensure no new fetch is triggered
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });

  test('check that we are sending an API request when we expect to', async() => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed"));
    const {rerender} = render(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />, { wrapper }
    );

    // Initial fetch 
    fireEvent.click(screen.getByRole('tab', { name: 'Results' }));
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    // Change tags param
    mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed&tags=tag1,tag2"));
    rerender(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );
    // Ensure a new fetch is triggered
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    // Change the tags order without changing the tags themselves
    mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed&tags=tag2,tag1"));
    rerender(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );
    // Ensure no fetch is triggered
    await waitFor(() => expect(global.fetch).not.toHaveBeenCalledTimes(3));

    // Delete a tag
    mockUseSearchParams.mockReturnValue(new URLSearchParams("requestor=user1&result=passed&tags=tag2"));
    rerender(
      <TestRunsTabs
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );

    // Ensure a new fetch is triggered
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
  });

  describe('Sorting Logic', () => {

    const unsortedRuns = [
      { runId: '1', testStructure: { runName: 'C Run', status: 'Passed', requestor: 'A User', tags: ['A tag'] } },
      { runId: '2', testStructure: { runName: 'A Run', status: 'Failed', requestor: 'B User', tags: ['B tag'] } },
      { runId: '3', testStructure: { runName: 'B Run', status: 'Passed', requestor: 'C User', tags: ['A tag', 'C tag']}},
      { runId: '0', testStructure: { runName: 'D Run', status:'Passed', requestor: 'A User', tags: ['D tag', 'A tag']}}
    ];

    const defaultTransformedRun = {
      bundle: "N/A", group: "N/A", package: "N/A", result: "N/A", submissionId: "N/A",
      submittedAt: "N/A", testName: "N/A", runName: "N/A"
    };

    beforeEach(() => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ runs: unsortedRuns, limitExceeded: false }),
        })
      );
    });

    test('sorts data by a single column in ascending order', async () => {
      const params = new URLSearchParams();
      params.set('sortOrder', 'runName:asc');
      mockUseSearchParams.mockReturnValue(params);

      render(
        <TestRunsTabs requestorNamesPromise={Promise.resolve([])} resultsNamesPromise={Promise.resolve([])} />, 
        { wrapper }
      );
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));

      await waitFor(() => {
        const lastCallArgs = TestRunsTableMock.mock.calls.slice(-1)[0][0];
        expect(lastCallArgs.runsList).toEqual([
          { ...defaultTransformedRun, id: '2', runName: 'A Run', status: 'Failed', requestor: 'B User', tags: 'B tag' },
          { ...defaultTransformedRun, id: '3', runName: 'B Run', status: 'Passed', requestor: 'C User', tags: 'A tag, C tag' },
          { ...defaultTransformedRun, id: '1', runName: 'C Run', status: 'Passed', requestor: 'A User', tags: 'A tag' },
          { ...defaultTransformedRun, id: '0', runName: 'D Run', status:'Passed', requestor: 'A User', tags: 'D tag, A tag'}
        ]);
      });
    });

    test('sorts data by a single column in descending order', async () => {
      const params = new URLSearchParams();
      params.set('sortOrder', 'runName:desc');
      mockUseSearchParams.mockReturnValue(params);

      render(
        <TestRunsTabs requestorNamesPromise={Promise.resolve([])} resultsNamesPromise={Promise.resolve([])} />, 
        { wrapper }
      );
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));

      await waitFor(() => {
        const lastCallArgs = TestRunsTableMock.mock.calls.slice(-1)[0][0];
        expect(lastCallArgs.runsList).toEqual([
          { ...defaultTransformedRun, id: '0', runName: 'D Run', status:'Passed', requestor: 'A User', tags: 'D tag, A tag'},
          { ...defaultTransformedRun, id: '1', runName: 'C Run', status: 'Passed', requestor: 'A User', tags: 'A tag' },
          { ...defaultTransformedRun, id: '3', runName: 'B Run', status: 'Passed', requestor: 'C User', tags: 'A tag, C tag' },
          { ...defaultTransformedRun, id: '2', runName: 'A Run', status: 'Failed', requestor: 'B User', tags: 'B tag' },
        ]);
      });
    });

    test('sorts by tags in ascending order', async () => {
      const params = new URLSearchParams();
      params.set('sortOrder', 'tags:asc');
      mockUseSearchParams.mockReturnValue(params);

      render(
        <TestRunsTabs requestorNamesPromise={Promise.resolve([])} resultsNamesPromise={Promise.resolve([])} />, 
        { wrapper }
      );
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));

      await waitFor(() => {
        const lastCallArgs = TestRunsTableMock.mock.calls.slice(-1)[0][0];
        expect(lastCallArgs.runsList).toEqual([
          { ...defaultTransformedRun, id: '1', runName: 'C Run', status: 'Passed', requestor: 'A User', tags: 'A tag' },
          { ...defaultTransformedRun, id: '3', runName: 'B Run', status: 'Passed', requestor: 'C User', tags: 'A tag, C tag' },
          { ...defaultTransformedRun, id: '2', runName: 'A Run', status: 'Failed', requestor: 'B User', tags: 'B tag' },
          { ...defaultTransformedRun, id: '0', runName: 'D Run', status:'Passed', requestor: 'A User', tags: 'D tag, A tag'}
        ]);
      });
    });


    test('sorts correctly with two keys where primary key has higher column order', async () => {
      const params = new URLSearchParams();
      params.set('columnsOrder', 'requestor,testName,runName,result,tags');
      params.set('sortOrder', 'runName:desc,requestor:asc');
      mockUseSearchParams.mockReturnValue(params);

      render(
        <TestRunsTabs requestorNamesPromise={Promise.resolve([])} resultsNamesPromise={Promise.resolve([])} />, 
        { wrapper }
      );
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));

      await waitFor(() => {
        const lastCallArgs = TestRunsTableMock.mock.calls.slice(-1)[0][0];
        expect(lastCallArgs.runsList).toEqual([
          { ...defaultTransformedRun, id: '0', runName: 'D Run', status:'Passed', requestor: 'A User', tags: 'D tag, A tag'},
          { ...defaultTransformedRun, id: '1', runName: 'C Run', status: 'Passed', requestor: 'A User', tags: 'A tag' },
          { ...defaultTransformedRun, id: '2', runName: 'A Run', status: 'Failed', requestor: 'B User', tags: 'B tag' },
          { ...defaultTransformedRun, id: '3', runName: 'B Run', status: 'Passed', requestor: 'C User', tags: 'A tag, C tag' },
        ]);
      });
    });


    test('sorts correctly with three keys and handles ties at each level', async () => {
      const mockedRuns = [
        {runId: '1', testStructure: {requestor: 'A User', status: 'Passed', tags: ['B tag'] }},
        {runId: '2', testStructure: {requestor: 'L User', status: 'Passed', tags: ['C tag']}},
        {runId: '3', testStructure: {requestor: 'B User', status: 'Passed', tags: ['A tag']}},
        {runId: '4', testStructure: {requestor: 'L User', status: 'Failed', tags: ['F tag']}},
        {runId: '5', testStructure: {requestor: 'A User', status: 'Passed', tags: ['A tag, L tag']}},
        {runId: '6', testStructure: {requestor: 'A User', status: 'Failed', tags: ['A tag, B tag']}}
      ];

      (global.fetch as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ runs: mockedRuns, limitExceeded: false }),
        })
      );

      const params = new URLSearchParams();
      params.set('columnsOrder', 'requestor,status,runName,result,tags');
      params.set('sortOrder', 'requestor:desc,tags:asc,status:asc');
      mockUseSearchParams.mockReturnValue(params);

      render(
        <TestRunsTabs requestorNamesPromise={Promise.resolve([])} resultsNamesPromise={Promise.resolve([])} />, 
        { wrapper }
      );
      fireEvent.click(screen.getByRole('tab', { name: 'Results' }));

      await waitFor(() => {
        const lastCallArgs = TestRunsTableMock.mock.calls.slice(-1)[0][0];
        expect(lastCallArgs.runsList).toEqual([
          {...defaultTransformedRun, id: '4', requestor: 'L User', status: 'Failed', tags: 'F tag'},
          {...defaultTransformedRun, id: '2', requestor: 'L User', status: 'Passed', tags: 'C tag'},
          {...defaultTransformedRun, id: '3', requestor: 'B User', status: 'Passed', tags: 'A tag'},
          {...defaultTransformedRun, id: '6', requestor: 'A User', status: 'Failed', tags: 'A tag, B tag'},
          {...defaultTransformedRun, id: '5', requestor: 'A User', status: 'Passed', tags: 'A tag, L tag'},
          {...defaultTransformedRun, id: '1', requestor: 'A User', status: 'Passed', tags: 'B tag' },
        ]);
      });
    });
  });
}); 