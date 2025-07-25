/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import TestRunsDetails from "@/components/test-runs/TestRunsDetails";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";


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


// Mock PageTile component
jest.mock('@/components/PageTile', () => {
  const PageTile = ({ translationKey }: any) => (
    <h1 data-testid="pagetile">{translationKey}</h1>
  );
  PageTile.displayName = 'PageTile';
  return {
    __esModule: true,
    default: PageTile,
  };
});

// Mock TestRunsTabs component
jest.mock('@/components/test-runs/TestRunsTabs', () => {
  const TestRunsTabs = () => (
    <div data-testid="mock-test-runs-tabs">Test Runs Tabs</div>
  );
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
      "TestRun.title": "Test Run Details",
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

const renderWithProviders = (ui: React.ReactElement) => {
  // Create a new client for each test
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};


Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

describe("TestRunsDetails", () => {
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

    const pageTile = screen.getByTestId('pagetile');
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
});

