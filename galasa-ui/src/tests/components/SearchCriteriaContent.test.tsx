/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import SearchCriteriaContent from "@/components/test-runs/SearchCriteriaContent";
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock child components 
jest.mock('@/components/test-runs/CustomSearchComponent', () => {
  return function MockCustomSearchComponent(props: any) {
    return (
      <div data-testid="mock-custom-search-component">
        <p>{props.title}</p>
        <input
          data-testid="search-input"
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
        />
        <button onClick={props.onSubmit}>Submit</button>
        <button onClick={props.onCancel}>Cancel</button>
      </div>
    );
  };
});

jest.mock('@/components/test-runs/CustomCheckBoxList', () => {
  return function MockCustomCheckBoxList(props: any) {
    return (
      <div data-testid="mock-custom-checkbox-list">
        <p>{props.title}</p>
        {props.items.map((item: string) => (
          <label key={item}>
            <input
              type="checkbox"
              checked={props.selectedItems.includes(item)}
              onChange={(e) => props.onChange(e.target.checked ? [...props.selectedItems, item] : props.selectedItems.filter((i: string) => i !== item))}
            />
            {item}
          </label>
        ))}
        <button onClick={props.onSubmit}>Submit</button>
        <button onClick={props.onCancel}>Cancel</button>
      </div>
    );
  };
});

// Mock next/mavigation router
const mockRouter = {
  replace: jest.fn(),
};
jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => '/test-runs',
  useSearchParams: () => new URLSearchParams(mockSearchParams),
}));
let mockSearchParams = '';


describe('SearchCriteriaContent', () => {
  const requestorNamesPromise = Promise.resolve(['req1', 'req2']);
  const resultsNamesPromise = Promise.resolve(['result1', 'result2']);

  // Reset mocks and params for each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = ''; 
  });
    

  test('renders correctly and selects the first filter by default', () => {
    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );

    expect(screen.getByText(/Edit search criteria/i)).toBeInTheDocument();
    expect(screen.getByText('Column Name')).toBeInTheDocument();
    expect(screen.getByText('Allowed Values')).toBeInTheDocument();

    // Check if the first filter is selected by default
    const testRunNameRow = screen.getByText('Test Run Name').closest('[role="row"]');
    expect(testRunNameRow).toBeInTheDocument();

    const rowWrapperDiv = testRunNameRow?.querySelector('.rowWrapper');
    expect(rowWrapperDiv).toBeInTheDocument();
    expect(rowWrapperDiv).toHaveClass('selectedRow');
        
    expect(screen.getByTestId('mock-custom-search-component')).toBeInTheDocument();
  });

    
  test('initialize state from URL search parameters' , async () => {
    mockSearchParams = 'runName=MyRun&status=Passed, Failed';

    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('MyRun')).toBeInTheDocument();
      expect(screen.getByText('Passed, Failed')).toBeInTheDocument();
    });
  });

  test('switching the rendered component when a different filter is clicked', async () => {
    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );

    // Initially, search component is visible
    expect(screen.getByTestId('mock-custom-search-component')).toBeInTheDocument();

    // Click on the 'status' row
    const statusRow = screen.getByText('Status').closest('div') ||  document.createElement('div');
    fireEvent.click(statusRow);

    // Checkbox list component should be visible
    const checkBoxComponent = await screen.findByTestId('mock-custom-checkbox-list');
    expect(checkBoxComponent).toBeInTheDocument();
  });

  test('saves a new value and updates the URL', async () => {
    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );

    // Find the input and submit button within the mocked component
    const searchComponent = screen.getByTestId('mock-custom-search-component');
    const input = within(searchComponent).getByTestId('search-input');
    const submitButton = within(searchComponent).getByText('Submit');

    // Simulate user typing a new value
    fireEvent.change(input, {target: {value: "New Test Run"}});

    // Simulate form submission
    fireEvent.click(submitButton);

    // Check the router is called with the new URL
    expect(mockRouter.replace).toHaveBeenCalledWith('/test-runs?runName=New+Test+Run', { scroll: false });
  });

  test('cancels an edit and reverts the input value', async () => {
    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );

    // Find the input and buttons within the mocked component
    const searchComponent = screen.getByTestId('mock-custom-search-component');
    const input = within(searchComponent).getByTestId('search-input');
    const cancelButton = within(searchComponent).getByText('Cancel');
    const saveButton = within(searchComponent).getByText('Submit');

    // Simulate user typing a value and save it
    fireEvent.change(input, {target: {value: "Save this value"}});
    fireEvent.click(saveButton);

    // Simulate user tyuping a value and canel it
    fireEvent.change(input, {target: {value: "Cancel this value"}});
    fireEvent.click(cancelButton);

    // Check that the input is reverted
    expect(input).toHaveValue('Save this value');
  });

  test('removes a parameter from the URL if its value is cleared', () => {
    mockSearchParams = 'runName=OldValue';
    render(
      <SearchCriteriaContent
        requestorNamesPromise={requestorNamesPromise}
        resultsNamesPromise={resultsNamesPromise}
      />
    );
    // Find the input and submit button within the mocked component
    const searchComponent = screen.getByTestId('mock-custom-search-component');
    const input = within(searchComponent).getByTestId('search-input');
    const submitButton = within(searchComponent).getByText('Submit');

    // Clear the input value
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.click(submitButton);

    // The parameter should be gone from the URL
    expect(mockRouter.replace).toHaveBeenCalledWith('/test-runs?', { scroll: false });
  });

  test('handles pending promises without crashing', () => {
    // Create promises that never resolve for this test
    const pendingRequestors: Promise<string[]> = new Promise(() => {});
    const pendingResults: Promise<string[]> = new Promise(() => {});

    render(<SearchCriteriaContent requestorNamesPromise={pendingRequestors} resultsNamesPromise={pendingResults} />);

    // Check that the UI renders correctly even with pending promises
    expect(screen.getByText('Edit search criteria to describe the test results you wish to view')).toBeInTheDocument();
    
    // Switch to a filter that depends on a promise
    const requestorRow = screen.getByText('Requestor').closest('[role="row"]') || document.createElement('div');
    fireEvent.click(requestorRow);
        
    // The component should still render its structure
    expect(screen.getByTestId('mock-custom-search-component')).toBeInTheDocument();
  });
});