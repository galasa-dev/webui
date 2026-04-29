/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import TestRunDetails from '@/components/test-runs/test-run-details/TestRunDetails';
import { downloadArtifactFromServer } from '@/actions/runsAction';
import { cleanArtifactPath, handleDownload } from '@/utils/artifacts';
import { TEST_RUN_PAGE_TABS } from '@/utils/constants/common';

function setup<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Mock window.history.replaceState
const mockReplaceState = jest.fn();
Object.defineProperty(window, 'history', {
  writable: true,
  value: {
    replaceState: mockReplaceState,
  },
});

let mockRouter: { replace: jest.Mock };

// Mock useHistoryBreadCrumbs hook
jest.mock('@/hooks/useHistoryBreadCrumbs', () => ({
  __esModule: true,
  default: () => ({
    breadCrumbItems: [
      { title: 'Home', route: '/' },
      { title: 'Test Runs', route: '/test-runs?searchCriteria123' },
    ],
  }),
}));

jest.mock('next/navigation', () => ({
  // The key is to return the mockRouter variable directly.
  useRouter: () => mockRouter,
  usePathname: jest.fn(() => '/test-runs/some-run-id'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('@/actions/runsAction');

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, opts?: { runName?: string }) => {
    const translations: Record<string, string> = {
      copiedTitle: 'Copied!',
      copiedMessage: 'URL copied to clipboard.',
      errorTitle: 'Error',
      warningTitle: 'Warning',
      copyFailedMessage: 'Failed to copy URL.',
      copyWarningMessage:
        'Clipboard API is not available. Please use HTTPS or copy the URL manually from the address bar.',
      downloadError: 'Download failed',
    };
    if (opts?.runName) {
      return `title:${opts.runName}`;
    }
    return translations[key] || key;
  },
}));

// Mock the useDateTimeFormat context
const mockFormatDate = (date: Date) => date.toLocaleString();
jest.mock('@/contexts/DateTimeFormatContext', () => ({
  useDateTimeFormat: () => ({
    formatDate: mockFormatDate,
  }),
}));

jest.mock('@/components/common/BreadCrumb', () => {
  const BreadCrumb = ({
    breadCrumbItems,
  }: {
    breadCrumbItems: Array<{ title: string; route: string }>;
  }) => {
    return (
      <div>
        <nav data-testid="breadcrumb-1" data-route={breadCrumbItems[0]?.route || ''}>
          {breadCrumbItems[0]?.title}
        </nav>
        <nav data-testid="breadcrumb-2" data-route={breadCrumbItems[1]?.route || ''}>
          {breadCrumbItems[1]?.title}
        </nav>
      </div>
    );
  };
  BreadCrumb.displayName = 'BreadCrumb';
  return {
    __esModule: true,
    default: BreadCrumb,
  };
});

jest.mock('@/components/PageTile', () => {
  const PageTile = ({ translationKey }: { translationKey: string }) => (
    <h1 data-testid="pagetile">{translationKey}</h1>
  );
  PageTile.displayName = 'PageTile';
  return {
    __esModule: true,
    default: PageTile,
  };
});

jest.mock('@/components/test-runs/test-run-details/OverviewTab', () => {
  const OverviewTab = ({ metadata }: { metadata?: { result?: string } }) => (
    <div>OverviewTab result={metadata?.result}</div>
  );
  OverviewTab.displayName = 'OverviewTab';
  return {
    __esModule: true,
    default: OverviewTab,
  };
});

jest.mock('@/components/test-runs/test-run-details/MethodsTab', () => {
  const MethodsTab = ({
    methods,
    onMethodClick,
  }: {
    methods?: unknown[];
    onMethodClick: (method: { runLogStartLine: number }) => void;
  }) => (
    <div>
      <p>MethodsTab count={methods?.length}</p>
      <button
        data-testid="mock-method-button"
        onClick={() => onMethodClick({ runLogStartLine: 123 })}
      >
        Clickable Mock Method
      </button>
    </div>
  );
  MethodsTab.displayName = 'MethodsTab';
  return {
    __esModule: true,
    default: MethodsTab,
  };
});

jest.mock('@/components/test-runs/test-run-details/LogTab', () => {
  const LogTab = ({ logs }: { logs: string }) => <div>LogTab logs={logs}</div>;
  LogTab.displayName = 'LogTab';
  return {
    __esModule: true,
    default: LogTab,
  };
});

jest.mock('@/components/test-runs/test-run-details/ArtifactsTab', () => {
  const ArtifactsTab = ({
    artifacts,
    runName,
    runId,
  }: {
    artifacts: unknown[];
    runName: string;
    runId: string;
  }) => (
    <div>
      ArtifactsTab count={artifacts.length} runName={runName} runId={runId}
    </div>
  );
  ArtifactsTab.displayName = 'ArtifactsTab';
  return {
    __esModule: true,
    ArtifactsTab,
  };
});

jest.mock('@/app/error/page', () => {
  const ErrorPage = () => <div>ErrorPage</div>;
  ErrorPage.displayName = 'ErrorPage';
  return {
    __esModule: true,
    default: ErrorPage,
  };
});

jest.mock('@/components/test-runs/test-run-details/TestRunSkeleton', () => {
  const TestRunSkeleton = () => <div>Skeleton</div>;
  TestRunSkeleton.displayName = 'TestRunSkeleton';
  return {
    __esModule: true,
    default: TestRunSkeleton,
  };
});

jest.mock('@/components/common/StatusIndicator', () => {
  const StatusIndicator = ({ status }: { status: string }) => <span>StatusIndicator:{status}</span>;
  StatusIndicator.displayName = 'StatusIndicator';
  return {
    __esModule: true,
    default: StatusIndicator,
  };
});

// Carbon React mocks
jest.mock('@carbon/react', () => {
  // Use a mutable object to store the onChange handler (named with Ref suffix for ESLint)
  const tabsStateRef = { current: null as ((event: { selectedIndex: number }) => void) | null };

  const Tabs = ({
    children,
    onChange,
  }: {
    children: React.ReactNode;
    onChange: (event: { selectedIndex: number }) => void;
  }) => {
    // Store onChange in a mutable object property
    // eslint-disable-next-line react-hooks/immutability -- Test mock needs to store handler for Tab components
    tabsStateRef.current = onChange;
    return <div>{children}</div>;
  };
  const Tab = ({
    children,
    renderIcon,
  }: {
    children: React.ReactNode;
    renderIcon?: React.ComponentType;
  }) => {
    const tabText = typeof children === 'string' ? children : '';
    const tabIndex = ['tabs.overview', 'tabs.methods', 'tabs.runLog', 'tabs.artifacts'].indexOf(
      tabText
    );

    const Icon = renderIcon;

    return (
      <button
        // When this button is clicked, call the stored onChange handler
        onClick={() => tabsStateRef.current?.({ selectedIndex: tabIndex })}
        // Use the text to make it findable in the test
        role="tab"
      >
        {Icon && <Icon />}
        {tabText}
      </button>
    );
  };
  const TabList = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const TabPanels = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const TabPanel = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  const Loading = () => <div>Loading</div>;
  const Tile = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tile">{children}</div>
  );
  const InlineNotification = ({
    title,
    subtitle,
    kind,
    className,
  }: {
    title: string;
    subtitle: string;
    kind: string;
    className?: string;
  }) => (
    <div className={className}>
      <strong>{title}</strong>
      <p>{subtitle}</p>
      <span>{kind}</span>
    </div>
  );
  const Button = ({
    children,
    renderIcon,
    ...props
  }: React.ComponentProps<'button'> & {
    renderIcon?: React.ComponentType;
  }) => {
    const Icon = renderIcon;
    return (
      <button {...props}>
        {Icon && <Icon />}
        {children}
      </button>
    );
  };
  [Tab, Tabs, TabList, TabPanels, TabPanel, Loading, InlineNotification, Button].forEach((c) => {
    // @ts-expect-error - Assigning displayName to function components for better debugging in React DevTools.
    c.displayName = c.name || 'Anonymous';
  });
  Tile.displayName = 'Tile';
  const Search = ({ ...props }: React.ComponentProps<'input'>) => {
    return <input {...props} data-testid="search" />;
  };
  return {
    Tab,
    Tabs,
    TabList,
    TabPanels,
    TabPanel,
    Loading,
    Tile,
    InlineNotification,
    Button,
    Search,
  };
});

beforeAll(() => {
  Object.assign(navigator, {
    clipboard: {
      writeText: jest.fn(),
    },
  });
});

jest.mock('@/utils/artifacts', () => ({
  handleDownload: jest.fn(),
  cleanArtifactPath: jest.fn((path: string) => path.replace(/^\//, '')),
}));

const mockDownloadArtifactFromServer = downloadArtifactFromServer as jest.Mock;
const mockHandleDownload = handleDownload as jest.Mock;
const mockCleanArtifactPath = cleanArtifactPath as jest.Mock;

describe('TestRunDetails', () => {
  const runId = 'run-123';

  beforeEach(() => {
    mockRouter = {
      replace: jest.fn(),
    };

    jest.clearAllMocks();
    mockReplaceState.mockClear();

    mockDownloadArtifactFromServer.mockClear();
    mockHandleDownload.mockClear();
    mockCleanArtifactPath.mockClear();
  });

  it('shows the skeleton while loading', async () => {
    const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();

    render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

    expect(screen.getByText('Skeleton')).toBeInTheDocument();

    await act(async () => {
      runDetailsDeferred.resolve({
        testStructure: {
          methods: [],
          result: 'PASS',
          status: 'OK',
          runName: 'r1',
          testShortName: 't1',
          bundle: 'b1',
          submissionId: 's1',
          group: 'g1',
          requestor: 'u1',
          user: 'u1',
          queued: '2025-01-01T00:00:00Z',
          startTime: '2025-01-01T00:00:00Z',
          endTime: '2025-01-01T01:00:00Z',
          tags: [],
        },
      });
    });
  });

  it('renders all tabs with correct props after successful load', async () => {
    const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();

    render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

    // Resolve both promises
    await act(async () => {
      runDetailsDeferred.resolve({
        testStructure: {
          methods: [{ name: 'm1' }, { name: 'm2' }],
          result: 'FAIL',
          status: 'ERROR',
          runName: 'MyRun',
          testShortName: 'TestA',
          bundle: 'BundleX',
          submissionId: 'Sub123',
          group: 'Grp',
          requestor: 'User',
          user: 'User',
          queued: '2025-01-01T00:00:00Z',
          startTime: '2025-01-01T00:00:00Z',
          endTime: '2025-01-01T02:00:00Z',
          tags: ['tag1'],
        },
      });
    });

    expect(await screen.findByText('title:MyRun')).toBeInTheDocument();
    expect(screen.getByText('OverviewTab result=FAIL')).toBeInTheDocument();
    expect(screen.getByText('MethodsTab count=2')).toBeInTheDocument();

    // Run log is not loaded initially, so an empty string should be displayed
    expect(screen.getByText('LogTab logs=')).toBeInTheDocument();

    // Artifacts are not loaded initially, so count should be 0
    expect(
      screen.getByText(`ArtifactsTab count=0 runName=MyRun runId=${runId}`)
    ).toBeInTheDocument();

    expect(screen.getByText('StatusIndicator:FAIL')).toBeInTheDocument();
  });

  it('renders the error page if any promise rejects', async () => {
    const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();

    render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

    await act(async () => {
      runDetailsDeferred.reject(new Error('failed to load'));
    });

    expect(await screen.findByText('ErrorPage')).toBeInTheDocument();
  });

  describe('Copy to Clipboard', () => {
    const mockTestStructure = {
      methods: [],
      result: 'PASS',
      status: 'OK',
      runName: 'TestRun',
      testShortName: 't',
      bundle: '',
      submissionId: '',
      group: '',
      requestor: '',
      user: '',
      queued: '',
      startTime: '',
      endTime: '',
      tags: [],
    };

    it('copies the URL when share button is clicked', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      render(<TestRunDetails runId="run-123" runDetailsPromise={runDetailsDeferred.promise} />);

      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('');
      });

      const spy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
      fireEvent.click(screen.getByTestId('icon-Share'));

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(window.location.href);
      });
      spy.mockRestore();
    });

    it('shows success notification when URL is copied', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      render(<TestRunDetails runId="run-123" runDetailsPromise={runDetailsDeferred.promise} />);

      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('');
      });

      const spy = jest.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);
      fireEvent.click(screen.getByTestId('icon-Share'));

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
        expect(screen.getByText('URL copied to clipboard.')).toBeInTheDocument();
      });
      spy.mockRestore();
    });

    it('shows error notification when copy fails on HTTPS', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      // Mock HTTPS protocol
      Object.defineProperty(window, 'location', {
        value: { href: 'https://example.com', protocol: 'https:' },
        writable: true,
      });

      render(<TestRunDetails runId="run-123" runDetailsPromise={runDetailsDeferred.promise} />);

      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('');
      });

      const spy = jest
        .spyOn(navigator.clipboard, 'writeText')
        .mockRejectedValue(new Error('Copy failed'));
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      fireEvent.click(screen.getByTestId('icon-Share'));

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to copy URL.')).toBeInTheDocument();
        expect(screen.getByText('error')).toBeInTheDocument();
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy:', expect.any(Error));
      spy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('shows warning notification when copy fails on HTTP', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      // Mock HTTP protocol
      Object.defineProperty(window, 'location', {
        value: { href: 'http://example.com', protocol: 'http:' },
        writable: true,
      });

      render(<TestRunDetails runId="run-123" runDetailsPromise={runDetailsDeferred.promise} />);

      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('');
      });

      const spy = jest
        .spyOn(navigator.clipboard, 'writeText')
        .mockRejectedValue(new Error('Copy failed'));

      fireEvent.click(screen.getByTestId('icon-Share'));

      await waitFor(() => {
        expect(screen.getByText('Warning')).toBeInTheDocument();
        expect(
          screen.getByText(
            'Clipboard API is not available. Please use HTTPS or copy the URL manually from the address bar.'
          )
        ).toBeInTheDocument();
        expect(screen.getByText('warning')).toBeInTheDocument();
      });

      spy.mockRestore();
    });
  });

  it('adds the test page URL to breadcrumb after page is loaded', async () => {
    const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
    const runLogDeferred = setup<string>();

    render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

    // Resolve both promises
    await act(async () => {
      runDetailsDeferred.resolve({
        testStructure: {
          methods: [{ name: 'm1' }, { name: 'm2' }],
          result: 'FAIL',
          status: 'ERROR',
          runName: 'MyRun',
          testShortName: 'TestA',
          bundle: 'BundleX',
          submissionId: 'Sub123',
          group: 'Grp',
          requestor: 'User',
          user: 'User',
          queued: '2025-01-01T00:00:00Z',
          startTime: '2025-01-01T00:00:00Z',
          endTime: '2025-01-01T02:00:00Z',
          tags: ['tag1'],
        },
      });
      runLogDeferred.resolve('This is the log');
    });

    expect(screen.getByTestId('breadcrumb-1')).toBeInTheDocument();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb-2')).toBeInTheDocument();
    expect(screen.getByText('Test Runs')).toBeInTheDocument();
  });

  describe('download artifacts', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    afterEach(() => {
      // Clean up fetch mock after each test
      if (global.fetch && typeof (global.fetch as jest.Mock).mockRestore === 'function') {
        (global.fetch as jest.Mock).mockRestore();
      }
    });

    test('correctly calls the zip endpoint and initiates download on success', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      // Mock window.location.origin
      Object.defineProperty(window, 'location', {
        writable: true,
        value: { ...window.location, origin: 'http://localhost' },
      });

      // Mock the successful fetch response
      const mockBlob = new Blob(['mock-zip-content'], { type: 'application/zip' });
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: {
          get: jest.fn().mockReturnValue('attachment; filename="TestRun-from-server.zip"'),
        },
        blob: jest.fn().mockResolvedValue(mockBlob),
      });

      render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

      // Resolve promises to load the component's data
      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: {
            methods: [],
            result: 'PASS',
            status: 'OK',
            runName: 'TestRun',
            testShortName: 'Test',
            bundle: 'Bundle',
            submissionId: 'Submission',
            group: 'Group',
            requestor: 'Requestor',
            user: 'Requestor',
            queued: '2025-01-01T00:00:00Z',
            startTime: '2025-01-01T00:00:00Z',
            endTime: '2025-01-01T01:00:00Z',
            tags: [],
          },
        });
        runLogDeferred.resolve('Log content');
      });

      // Act
      const downloadButton = screen.getByTestId('icon-download-all');

      await act(async () => {
        fireEvent.click(downloadButton);
      });

      // Wait for all async operations in handleDownloadAll to complete
      await waitFor(
        () => {
          expect(handleDownload).toHaveBeenCalled();
        },
        { timeout: 500 }
      );

      // Verify the correct API endpoint was called
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost/internal-api/test-runs/${runId}/zip?runName=TestRun`
      );

      expect(handleDownload).toHaveBeenCalledWith(mockBlob, 'TestRun-from-server.zip');
      // Ensure loading state is gone
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    test('shows an error notification if download fails', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      // Mock fetch to reject
      (fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

      // Resolve promises to load the component's data
      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: {
            methods: [],
            result: 'PASS',
            status: 'OK',
            runName: 'TestRun',
            testShortName: 'Test',
            bundle: 'Bundle',
            submissionId: 'Submission',
            group: 'Group',
            requestor: 'Requestor',
            user: 'Requestor',
            queued: '2025-01-01T00:00:00Z',
            startTime: '2025-01-01T00:00:00Z',
            endTime: '2025-01-01T01:00:00Z',
            tags: [],
          },
        });
        runLogDeferred.resolve('Log content');
      });
      mockDownloadArtifactFromServer.mockRejectedValue(new Error('Download failed'));

      const downloadButton = screen.getByTestId('icon-download-all');
      fireEvent.click(downloadButton);

      await waitFor(() => {
        expect(screen.getByText('Download failed')).toBeInTheDocument();
      });
    });
  });

  describe('URL handling', () => {
    const mockTestStructure = {
      methods: [],
      result: 'PASS',
      status: 'OK',
      runName: 'TestRun',
      testShortName: 'Test',
      bundle: 'Bundle',
      submissionId: 'Submission',
      group: 'Group',
      requestor: 'Requestor',
      user: 'Requestor',
      queued: '2025-01-01T00:00:00Z',
      startTime: '2025-01-01T00:00:00Z',
      endTime: '2025-01-01T01:00:00Z',
      tags: [],
    };

    test('updates URL with the current tab', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

      // Resolve promises to load the component's data
      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('Log content');
      });

      await screen.findByText('title:TestRun');

      // Click on the "Methods" tab
      const methodsTabButton = screen.getByRole('tab', { name: 'tabs.methods' });
      fireEvent.click(methodsTabButton);

      // Check that window.history.replaceState has been called correctly
      expect(mockReplaceState).toHaveBeenCalledTimes(1);
      expect(mockReplaceState).toHaveBeenCalledWith(null, '', `/test-runs/some-run-id?tab=methods`);

      // Click on the "Artifacts" tab
      const artifactsTabButton = screen.getByRole('tab', { name: 'tabs.artifacts' });
      fireEvent.click(artifactsTabButton);

      // Check that window.history.replaceState has been called correctly
      expect(mockReplaceState).toHaveBeenCalledTimes(2);
      expect(mockReplaceState).toHaveBeenCalledWith(
        null,
        '',
        '/test-runs/some-run-id?tab=artifacts'
      );
    });

    test('navigates to the log tab with the correct line number when a method is clicked', async () => {
      const runDetailsDeferred = setup<{ testStructure: Record<string, unknown> }>();
      const runLogDeferred = setup<string>();

      render(<TestRunDetails runId={runId} runDetailsPromise={runDetailsDeferred.promise} />);

      // Resolve promises to load the component's data
      await act(async () => {
        runDetailsDeferred.resolve({
          testStructure: mockTestStructure,
        });
        runLogDeferred.resolve('Log content');
      });
      await screen.findByText('title:TestRun');

      // Navigate to the methods tab
      const methodsTabButton = screen.getByRole('tab', { name: 'tabs.methods' });
      fireEvent.click(methodsTabButton);

      // Find and click the specific mock button inside our mocked MethodsTab
      const mockMethod = screen.getByTestId('mock-method-button');
      fireEvent.click(mockMethod);

      // Assert that window.history.replaceState was called with the correct URL
      const logTabIndex = TEST_RUN_PAGE_TABS.indexOf('runLog');
      const expectedTabParam = `tab=${TEST_RUN_PAGE_TABS[logTabIndex]}`;
      const expectedLineParam = `line=123`;

      expect(mockReplaceState).toHaveBeenCalledTimes(2); // 1st for tab change, 2nd for method click
      expect(mockReplaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining(expectedTabParam)
      );
      expect(mockReplaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining(expectedLineParam)
      );

      const expectedUrl = `/test-runs/some-run-id?${expectedTabParam}&${expectedLineParam}`;
      expect(mockReplaceState).toHaveBeenLastCalledWith(null, '', expectedUrl);
    });
  });
});
