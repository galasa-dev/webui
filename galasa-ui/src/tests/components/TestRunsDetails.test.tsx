/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import TestRunsDetails from '@/components/test-runs/TestRunsDetails';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock useHistoryBreadCrumbs hook to return a mock history breadcrumbs.
jest.mock('@/hooks/useHistoryBreadCrumbs', () => ({
  __esModule: true,
  default: () => ({
    breadCrumbItems: [{ title: 'Home', route: '/' }],
  }),
}));

// Mock BreadCrumb component
jest.mock('@/components/common/BreadCrumb', () => {
  const BreadCrumb = ({ breadCrumbItems }: { breadCrumbItems: any[] }) => (
    <nav data-testid="breadcrumb" data-route={breadCrumbItems[0]?.route || ''}>
      Home
    </nav>
  );
  BreadCrumb.displayName = 'BreadCrumb';
  return {
    __esModule: true,
    default: BreadCrumb,
  };
});

// Mock TestRunsTabs component
jest.mock('@/components/test-runs/TestRunsTabs', () => {
  const TestRunsTabs = () => <div data-testid="mock-test-runs-tabs">Test Runs Tabs</div>;
  TestRunsTabs.displayName = 'TestRunsTabs';
  return {
    __esModule: true,
    default: TestRunsTabs,
  };
});

// Mock translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'TestRun.title': 'Test Run Details',
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
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
  Share: () => <span>Share Icon</span>,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  // Create a new client for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });
});

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

    const breadcrumb = screen.getByTestId('breadcrumb');
    expect(breadcrumb).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();

    const pageTile = screen.getByTestId('tile');
    expect(pageTile).toBeInTheDocument();
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
      expect(shareButton).toBeInTheDocument();

      await shareButton.click();

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(window.location.href);
    });
  });

  test('shows success notification when URL is copied', async () => {
    renderWithProviders(
      <TestRunsDetails
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );

    const shareButton = screen.getByTestId('share-button');
    await shareButton.click();

    const notification = await screen.findByTestId('notification');
    expect(notification).toHaveClass('notification-success');
    expect(notification).toHaveTextContent('copiedTitle');
  });

  test('shows error notification when copy fails', async () => {
    // Override the clipboard writeText method to simulate failure
    navigator.clipboard.writeText = jest.fn().mockRejectedValue(new Error('Copy failed'));

    renderWithProviders(
      <TestRunsDetails
        requestorNamesPromise={mockRequestorNamesPromise}
        resultsNamesPromise={mockResultsNamesPromise}
      />
    );

    const shareButton = screen.getByTestId('share-button');
    await shareButton.click();

    const notification = await screen.findByTestId('notification');
    expect(notification).toHaveClass('notification-error');
    expect(notification).toHaveTextContent('errorTitle');
  });
});
