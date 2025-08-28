/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TableOfScreenshots from '@/components/test-runs/test-run-details/3270Tab/TableOfScreenshots';
import {
  populateFlattenedZos3270TerminalDataAndAllImageData,
  splitScreenAndTerminal,
  flattenedZos3270TerminalData,
  allImageData,
} from '@/utils/3270/get3270Screenshots';
import userEvent from '@testing-library/user-event';
import { get3270Screenshots } from '@/utils/3270/get3270Screenshots';
import { CellFor3270, TerminalImage } from '@/utils/interfaces/common';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, any>) => {
    const translations: Record<string, string> = {
      Terminal: 'Terminal',
      ScreenNumber: 'Screen Number',
      Time: 'Time',
      Method: 'Method',
      searchPlaceholder: 'Search',
      ariaLabel: 'ariaLabel',
      'pagination.backwardText': 'Previous page',
      'pagination.forwardText': 'Next page',
      'pagination.itemsPerPageText': 'Items per page:',
      'pagination.pageNumberText': 'Page Number',
      'pagination.of': 'of',
      'pagination.items': 'items',
      'pagination.pages': 'pages',
    };

    let text = translations[key] || key;

    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }

    return text;
  },
}));

const defaultProps = {
  zos3270TerminalData: [],
  runId: 'testRunId',
  setIsError: jest.fn(),
};

jest.mock('@/utils/3270/get3270Screenshots', () => {
  const originalModule = jest.requireActual('@/utils/3270/get3270Screenshots');
  return {
    // Spread all the original exports so they remain intact, so other non-mocked functions in the same file can be used.
    ...originalModule,
    get3270Screenshots: jest.fn(),
  };
});
const mockGet3270Screenshots = get3270Screenshots as jest.Mock;

type MockData = {
  newFlattenedZos3270TerminalData: CellFor3270[];
  newAllImageData: TerminalImage[];
};

const emptyMockData: MockData = {
  newFlattenedZos3270TerminalData: [{ id: '', Terminal: '', ScreenNumber: 0 }],
  newAllImageData: [{ id: '', imageFields: [] }],
};

const someMockData: MockData = {
  newFlattenedZos3270TerminalData: [
    { id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', ScreenNumber: 1 },
  ],
  newAllImageData: [{ id: 'IYK2ZNB5_1-101', imageFields: [{ row: 0, column: 0, text: 'Test' }] }],
};

const mockData: MockData = {
  newFlattenedZos3270TerminalData: [
    { id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', ScreenNumber: 1 },
    { id: 'IYK2ZNB5_2-101', Terminal: 'IYK2ZNB5_2', ScreenNumber: 1 },
  ],
  newAllImageData: [
    { id: 'IYK2ZNB5_1-101', imageFields: [{ row: 0, column: 0, text: 'Test' }] },
    { id: 'IYK2ZNB5_2-101', imageFields: [{ row: 0, column: 0, text: 'Test' }] },
  ],
};

describe('TableOfScreenshots', () => {
  test('shows loading state when isLoading is true', () => {
    // Act
    mockGet3270Screenshots.mockResolvedValue(emptyMockData);

    render(
      <TableOfScreenshots
        isLoading={true}
        setIsLoading={jest.fn()}
        setImageData={jest.fn()}
        {...defaultProps}
      />
    );

    // Assert
    expect(screen.getByTestId('loading-table-skeleton')).toBeInTheDocument();
  });

  test('fetches data then sets isLoading to false', async () => {
    // Act
    const setIsLoading = jest.fn();

    mockGet3270Screenshots.mockResolvedValue(someMockData);

    await act(async () => {
      render(
        <TableOfScreenshots
          isLoading={true}
          setIsLoading={setIsLoading}
          setImageData={jest.fn()}
          {...defaultProps}
        />
      );
    });

    // Assert
    expect(mockGet3270Screenshots).toHaveBeenCalledWith([], 'testRunId');
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  test('rowClick updates imageData on click', async () => {
    // Act
    const setImageData = jest.fn();

    mockGet3270Screenshots.mockResolvedValue(someMockData);

    const user = userEvent.setup();

    await act(async () => {
      render(
        <TableOfScreenshots
          isLoading={false}
          setIsLoading={jest.fn()}
          setImageData={setImageData}
          {...defaultProps}
        />
      );
    });

    const rowClickElement = await screen.findByTestId('table-row');

    await user.click(rowClickElement);

    // Assert
    expect(setImageData).toHaveBeenCalledWith({
      id: 'IYK2ZNB5_1-101',
      imageFields: [{ column: 0, row: 0, text: 'Test' }],
    });
  });

  test('renders search input and updates filtered rows', async () => {
    // Act
    mockGet3270Screenshots.mockResolvedValue(mockData);

    await act(async () => {
      render(
        <TableOfScreenshots
          isLoading={false}
          setIsLoading={jest.fn()}
          setImageData={jest.fn()}
          {...defaultProps}
        />
      );
    });

    await userEvent.type(screen.getByRole('searchbox'), 'IYK2ZNB5_1');

    // Assert
    expect(screen.getByRole('searchbox')).toHaveValue('IYK2ZNB5_1');

    expect(await screen.findByText('IYK2ZNB5_1')).toBeInTheDocument();
    expect(screen.queryByText('IYK2ZNB5_2')).not.toBeInTheDocument();
  });

  test('renders dropdown for terminal selection', async () => {
    // Act
    mockGet3270Screenshots.mockResolvedValue(mockData);

    await act(async () => {
      render(
        <TableOfScreenshots
          isLoading={false}
          setIsLoading={jest.fn()}
          setImageData={jest.fn()}
          {...defaultProps}
        />
      );
    });

    // Assert
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown).toBeInTheDocument();
  });
});
