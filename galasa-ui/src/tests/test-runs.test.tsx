/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Run } from '@/generated/galasaapi';
import TestRunsPage from '@/app/test-runs/page'; 
import { getRequestorList, getResultsNames } from '@/utils/testRuns';

jest.mock('@/app/test-runs/page', () => {
  const originalModule = jest.requireActual('@/app/test-runs/page');
  return {
    __esModule: true,
    default: originalModule.default,
    fetchAllTestRunsByPaging: jest.fn(),
  };
});

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the child components.
jest.mock('@/components/test-runs/TestRunsTabs', () =>
  function MockTestRunsTabs() {
    return <div data-testid="mock-test-runs-tabs" />;
  }
);

jest.mock('@/components/PageTile', () =>
  function MockPageTile() {
    return <div data-testid="page-tile" />;
  }
);

jest.mock('@/components/common/BreadCrumb', () =>
  function MockBreadCrumb() {
    return <div data-testid="breadcrumb" />;
  }
);

jest.mock('@/utils/testRuns', () => ({
  getRequestorList: jest.fn(),
  getResultsNames: jest.fn(),
}));

jest.mock('@/components/test-runs/TestRunsDetails', () => {
  return function MockTestRunsDetails({ requestorNamesPromise, resultsNamesPromise }: any) {
    return <div data-testid="mock-test-runs-details" />;
  };
});

const mockedGetRequestorList = getRequestorList as jest.Mock;
const mockedGetResultsNames = getResultsNames as jest.Mock;


describe('TestRunsPage', () => {
  beforeEach(() => {
    // Clear mocks before each test.
    mockedGetRequestorList.mockClear();
    mockedGetResultsNames.mockClear();
  });

  test('should call data fetching functions and render TestRunsDetails', async () => {
    // Arrange: Set up mock return values for the promises
    const mockRequestors = Promise.resolve(['user1', 'user2']);
    const mockResults = Promise.resolve(['Passed', 'Failed']);
    mockedGetRequestorList.mockReturnValue(mockRequestors);
    mockedGetResultsNames.mockReturnValue(mockResults);
    
    // Act
    const Page = await TestRunsPage();
    render(Page);
    
    // Check that the data fetching functions were called
    expect(mockedGetRequestorList).toHaveBeenCalledTimes(1);
    expect(mockedGetResultsNames).toHaveBeenCalledTimes(1);
    
    // Check that the child component was rendered
    await waitFor(() => {
      expect(screen.getByTestId('mock-test-runs-details')).toBeInTheDocument();
    });
  });
});
