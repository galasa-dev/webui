/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, waitFor } from '@testing-library/react';
import { Run } from '@/generated/galasaapi';
import TestRunsPage, { fetchAllTestRunsForLastDay } from '@/app/test-runs/page';

jest.mock('@/app/test-runs/page', () => {
  const originalModule = jest.requireActual('@/app/test-runs/page');
  return {
    __esModule: true,
    default: originalModule.default,
    fetchAllTestRunsForLastDay: jest.fn(),
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

const mockedFetch = fetchAllTestRunsForLastDay as jest.Mock;

describe('TestRunsPage', () => {
  beforeEach(() => {
    // Clear the mock before each test.
    mockedFetch.mockClear();
  });

  test('renders the final content after data is successfully fetched', async () => {
    // Arrange
    const mockRuns = [{ runId: '1' }, { runId: '2' }] as Run[];
    mockedFetch.mockResolvedValue(mockRuns);

    // Act
    const page = await TestRunsPage();
    render(page);

    // Assert
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByTestId('mock-test-runs-tabs')).toBeInTheDocument();
    });
  });

  test('renders the main content structure', async () => {
    // Arrange
    mockedFetch.mockResolvedValue([]);

    // Act
    const Page = await TestRunsPage();
    render(Page);

    // Assert
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByTestId('page-tile')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });
});
