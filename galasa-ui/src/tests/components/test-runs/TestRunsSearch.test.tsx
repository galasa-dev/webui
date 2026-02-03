/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import TestRunsSearch from '@/components/test-runs/TestRunsSearch';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Nav from 'next/navigation';

let mockSearchParams = new URLSearchParams();

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn((newUrl) => {
    const newQueryString = newUrl.split('?')[1] || '';
    mockSearchParams = new URLSearchParams(newQueryString);
  }),
};

const noRunsResponse = {
  runs: [],
};
const singleRunResponse = {
  runs: [
    {
      runId: 'run-123',
      runName: 'U123',
      testStructure: {
        startTime: '2026-01-01T10:00:00Z',
      },
    },
  ],
};
const multipleRunsResponse = {
  runs: [
    {
      runId: 'run-1',
      runName: 'U123', // same run name as below intentional.
      testStructure: { startTime: '2026-01-01T10:00:00Z' },
    },
    {
      runId: 'run-2',
      runName: 'U123',
      testStructure: { startTime: '2026-01-02T10:00:00Z' },
    },
  ],
};

// Mock the fetch that is called when "Search by Test Run Name" is used
const mockFetchResponse = (data: any, ok = true) => {
  return jest.spyOn(global, 'fetch').mockResolvedValueOnce({
    ok,
    json: async () => data,
  } as Response);
};

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/mock-path'),
  useSearchParams: jest.fn(() => mockSearchParams),
  useRouter: jest.fn(() => mockRouter),
}));

// Carbon React mocks
jest.mock('@carbon/react', () => ({
  Button: ({ children, iconDescription, disabled, ...props }: any) => (
    <button {...props} aria-label={iconDescription} disabled={disabled}>
      {children}
    </button>
  ),
  InlineNotification: ({ title, subtitle, kind }: any) => (
    <div data-testid="notification" className={`notification-${kind}`}>
      <strong>{title}</strong>
      <p>{subtitle}</p>
    </div>
  ),
  Search: ({ ...props }: any) => <input {...props} data-testid="search" />,
}));

// Mock translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: { name: string }) =>
    ({
      infoTitle: 'Info',
      noTestRunsFoundMessage: 'No test runs found.',
    })[key] || key,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = new URLSearchParams();
  (Nav.useSearchParams as jest.Mock).mockImplementation(() => mockSearchParams);
});

describe('Search by Test Run Name', () => {
  test('search go button disabled if search text is empty', async () => {
    // Arrange
    render(<TestRunsSearch></TestRunsSearch>);

    // Act
    const searchInput = screen.getByTestId('search');
    expect(searchInput).toHaveValue('');

    // Assert
    const goButton = screen.getByRole('button', { name: 'searchButtonLabel' });
    expect(goButton).toBeDisabled();
  });

  test('search go button enabled when search text is not empty', async () => {
    // Arrange
    render(<TestRunsSearch></TestRunsSearch>);
    const user = userEvent.setup();

    const searchInput = screen.getByTestId('search');
    expect(searchInput).toHaveValue('');

    const goButton = screen.getByRole('button', { name: 'searchButtonLabel' });
    expect(goButton).toBeDisabled();

    // Act
    await user.type(searchInput, 'U123');

    // Assert
    expect(searchInput).toHaveValue('U123');
    expect(goButton).toBeEnabled();
  });

  test('search by test run name one result takes you to test run details page', async () => {
    // Arrange
    render(<TestRunsSearch></TestRunsSearch>);
    const user = userEvent.setup();

    mockFetchResponse(singleRunResponse);

    const searchInput = screen.getByTestId('search');
    const goButton = screen.getByRole('button', { name: 'searchButtonLabel' });

    // Act
    await user.type(searchInput, 'U123');
    await user.click(goButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/test-runs/run-123');
  });

  test('search by test run name no results notifies no runs found', async () => {
    // Arrange
    render(<TestRunsSearch></TestRunsSearch>);
    const user = userEvent.setup();

    mockFetchResponse(noRunsResponse);

    const searchInput = screen.getByTestId('search');
    const goButton = screen.getByRole('button', { name: 'searchButtonLabel' });

    // Act
    await user.type(searchInput, 'U123');
    await user.click(goButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Assert
    const notification = await screen.findByTestId('notification');
    expect(notification).toHaveClass('notification-info');
    expect(notification).toHaveTextContent('No test runs found.');
  });

  test('search by test run name multiple results takes you to latest runs test run details page', async () => {
    // Arrange
    render(<TestRunsSearch></TestRunsSearch>);
    const user = userEvent.setup();

    mockFetchResponse(multipleRunsResponse);

    const searchInput = screen.getByTestId('search');
    const goButton = screen.getByRole('button', { name: 'searchButtonLabel' });

    // Act
    await user.type(searchInput, 'U123');
    await user.click(goButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/test-runs/run-2');
  });
});
