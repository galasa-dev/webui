/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import TestRunsDetails from '@/components/test-runs/TestRunsDetails';
import { render, screen, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SavedQueriesProvider } from '@/contexts/SavedQueriesContext';
import { DateTimeFormatProvider } from '@/contexts/DateTimeFormatContext';
import * as Nav from 'next/navigation';

let mockSearchParams = new URLSearchParams();
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn((newUrl) => {
    const newQueryString = newUrl.split('?')[1] || '';
    mockSearchParams = new URLSearchParams(newQueryString);
  }),
};

const mockGetResolvedTimeZone = jest.fn(() => 'UTC');

// Mock useHistoryBreadCrumbs hook
jest.mock('@/hooks/useHistoryBreadCrumbs', () => ({
  __esModule: true,
  default: () => ({
    breadCrumbItems: [{ title: 'Home', route: '/' }],
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => mockSearchParams),
  useRouter: jest.fn(() => mockRouter),
}));

jest.mock('@/contexts/DateTimeFormatContext', () => ({
  DateTimeFormatProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useDateTimeFormat: () => ({
    getResolvedTimeZone: mockGetResolvedTimeZone,
  }),
}));

// Mock other components
jest.mock('@/components/common/BreadCrumb', () => {
  const BreadCrumb = ({ breadCrumbItems }: { breadCrumbItems: any[] }) => (
    <nav data-testid="breadcrumb" data-route={breadCrumbItems[0]?.route || ''}>
      Home
    </nav>
  );
  BreadCrumb.displayName = 'BreadCrumb';
  return { __esModule: true, default: BreadCrumb };
});

jest.mock('@/components/test-runs/TestRunsTabs', () => {
  const TestRunsTabs = () => <div data-testid="mock-test-runs-tabs">Test Runs Tabs</div>;
  TestRunsTabs.displayName = 'TestRunsTabs';
  return { __esModule: true, default: TestRunsTabs };
});

jest.mock('@/components/test-runs/saved-queries/CollapsibleSideBar', () => {
  const CollapsibleSideBar = () => (
    <div data-testid="mock-collapsible-sidebar">Collapsible SideBar</div>
  );
  CollapsibleSideBar.displayName = 'CollapsibleSideBar';
  return { __esModule: true, default: CollapsibleSideBar };
});

// Mock translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) =>
    ({
      'TestRun.title': 'Test Run Details',
      copiedTitle: 'Copied!',
      copiedMessage: 'URL copied to clipboard.',
      errorTitle: 'Error',
      copyFailedMessage: 'Failed to copy URL.',
    })[key] || key,
}));

// Carbon React mocks
jest.mock('@carbon/react', () => ({
  Button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  Tile: ({ children, ...props }: any) => (
    <div {...props} data-testid="tile">
      {children}
    </div>
  ),
  InlineNotification: ({ title, subtitle, kind }: any) => (
    <div data-testid="notification" className={`notification-${kind}`}>
      <strong>{title}</strong>
      <p>{subtitle}</p>
    </div>
  ),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <DateTimeFormatProvider>
        <SavedQueriesProvider>{ui}</SavedQueriesProvider>
      </DateTimeFormatProvider>
    </QueryClientProvider>
  );
};

beforeAll(() => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  Object.defineProperty(window, 'matchMedia', {
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
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams();
  (Nav.useSearchParams as jest.Mock).mockImplementation(() => mockSearchParams);
});

const mockRequestorNamesPromise = Promise.resolve(['requestor1', 'requestor2']);
const mockResultsNamesPromise = Promise.resolve(['result1', 'result2']);

describe('TestRunsDetails', () => {
  test('renders breadcrumbs and page title', () => {
    renderWithProviders(
      <TestRunsDetails
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByTestId('tile')).toBeInTheDocument();
  });

  test('should render the main content area with TestRunsTabs', () => {
    renderWithProviders(
      <TestRunsDetails
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );
    expect(screen.getByTestId('mock-test-runs-tabs')).toBeInTheDocument();
  });

  describe('Copy to Clipboard', () => {
    test('copies the URL when share button is clicked', async () => {
      renderWithProviders(
        <TestRunsDetails
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />
      );
      const shareButton = screen.getByTestId('share-button');
      await act(async () => {
        shareButton.click();
      });
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    });

    test('shows success notification when URL is copied', async () => {
      renderWithProviders(
        <TestRunsDetails
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />
      );
      const shareButton = screen.getByTestId('share-button');
      await act(async () => {
        shareButton.click();
      });
      const notification = await screen.findByTestId('notification');
      expect(notification).toHaveClass('notification-success');
      expect(notification).toHaveTextContent('Copied!');
    });

    test('shows error notification when copy fails', async () => {
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValueOnce(new Error('Copy failed'));
      renderWithProviders(
        <TestRunsDetails
          requestorNamesPromise={mockRequestorNamesPromise}
          resultsNamesPromise={mockResultsNamesPromise}
        />
      );
      const shareButton = screen.getByTestId('share-button');
      await act(async () => {
        shareButton.click();
      });
      const notification = await screen.findByTestId('notification');
      expect(notification).toHaveClass('notification-error');
      expect(notification).toHaveTextContent('Error');
    });
  });
});
