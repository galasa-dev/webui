/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React  from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
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
import { TreeNodeData } from '@/utils/functions/artifacts';
import { CellFor3270, TerminalImage } from '@/utils/interfaces/common';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: Record<string, any>) => {
    const translations: Record<string, string> = {
        "Terminal": "Terminal",
        "ScreenNumber": "Screen Number",
        "Time": "Time",
        "Method": "Method",
        "searchPlaceholder": "Search",
        "ariaLabel": "ariaLabel",
        "pagination.backwardText": "Previous page",
        "pagination.forwardText": "Next page",
        "pagination.itemsPerPageText": "Items per page:",
        "pagination.pageNumberText": "Page Number",
        "pagination.of": "of",
        "pagination.items": "items",
        "pagination.pages": "pages"
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

describe('splitScreenAndTerminal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('test split when input has no dashes', () => {
    expect(() => {
      splitScreenAndTerminal('term1');
    }).toThrow('Invalid terminal ID or screen number');
  });

  test('test split when input has only one dash', () => {
    expect(() => {
      splitScreenAndTerminal('-');
    }).toThrow('Invalid terminal ID or screen number');
  });

  test('test split when input has a terminal name with dash without terminal number', () => {
    expect(() => {
      splitScreenAndTerminal('term1-');
    }).toThrow('Invalid terminal ID or screen number');
  });

  test('test split with invalid screen number', () => {
    expect(() => {
      splitScreenAndTerminal('term1-a');
    }).toThrow('Invalid terminal ID or screen number');
  });

  test('test split when input has only one dash with terminal number', () => {
    expect(splitScreenAndTerminal('--2')).toEqual({ screenNumber: 2, terminalName: '-' });
  });

  test('test split with correct input with 1 dash', () => {
    expect(splitScreenAndTerminal('term1-1')).toEqual({ screenNumber: 1, terminalName: 'term1' });
  });

  test('test split with correct input with more than 1 dash', () => {
    expect(splitScreenAndTerminal('term1-is-the-best-1')).toEqual({
      screenNumber: 1,
      terminalName: 'term1-is-the-best',
    });
  });

  test('test split with correct input with more than 1 dash in odd placement', () => {
    expect(splitScreenAndTerminal('term1--1')).toEqual({ screenNumber: 1, terminalName: 'term1-' });
  });
});

describe('get3270Screenshots -> populateFlattenedZos3270TerminalDataAndAllImageData', () => {
  // Example given is only a single image.
  const mockImages: any = [
    {
      sequence: 101,
      id: 'IYK2ZNB5_1-101',
      imageSize: { columns: 80, rows: 24 },
      cursorColumn: 25,
      cursorRow: 1,
      aid: 'PF9',
      fields: [
        {
          row: 0,
          column: 0,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [
            {
              text: ' INQUIRE PROGRAM(NONEX)                                                       ',
            },
          ],
        },
        {
          row: 0,
          column: 79,
          fieldProtected: true,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: ' ' }],
        },
        {
          row: 1,
          column: 1,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'STATUS: ' }],
        },
        {
          row: 1,
          column: 10,
          fieldProtected: true,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [
            {
              text: 'RESULTS - OVERTYPE TO MODIFY                                         ',
            },
          ],
        },
        {
          row: 2,
          column: 0,
          fieldProtected: true,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: ' ' }],
        },
        {
          row: 2,
          column: 2,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'Prog(NONEX   )' }],
        },
        {
          row: 2,
          column: 17,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '                ' }],
        },
        {
          row: 2,
          column: 34,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 38,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 42,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 46,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 50,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 54,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 58,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '   ' }],
        },
        {
          row: 2,
          column: 62,
          fieldProtected: true,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [
            {
              text: 'NOT FOUND                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ',
            },
          ],
        },
        {
          row: 21,
          column: 53,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'SYSID=CICS' }],
        },
        {
          row: 21,
          column: 64,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'APPLID=IYK2ZNB5  ' }],
        },
        {
          row: 22,
          column: 2,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'RESPONSE:' }],
        },
        {
          row: 22,
          column: 12,
          fieldProtected: true,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: '1 ERROR                            ' }],
        },
        {
          row: 22,
          column: 48,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: 'TIME: 07.01.16  DATE: 08/05/25 ' }],
        },
        {
          row: 23,
          column: 0,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'PF' }],
        },
        {
          row: 23,
          column: 3,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '1' }],
        },
        {
          row: 23,
          column: 5,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'HELP' }],
        },
        {
          row: 23,
          column: 10,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '     ' }],
        },
        {
          row: 23,
          column: 16,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '3' }],
        },
        {
          row: 23,
          column: 18,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'END' }],
        },
        {
          row: 23,
          column: 22,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '     ' }],
        },
        {
          row: 23,
          column: 28,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '5' }],
        },
        {
          row: 23,
          column: 30,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'VAR' }],
        },
        {
          row: 23,
          column: 34,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '      ' }],
        },
        {
          row: 23,
          column: 41,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '7' }],
        },
        {
          row: 23,
          column: 43,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'SBH' }],
        },
        {
          row: 23,
          column: 47,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '8' }],
        },
        {
          row: 23,
          column: 49,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'SFH' }],
        },
        {
          row: 23,
          column: 53,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '9' }],
        },
        {
          row: 23,
          column: 55,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'MSG' }],
        },
        {
          row: 23,
          column: 59,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '10' }],
        },
        {
          row: 23,
          column: 62,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'SB' }],
        },
        {
          row: 23,
          column: 65,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '11' }],
        },
        {
          row: 23,
          column: 68,
          fieldIntenseDisplay: true,
          fieldSelectorPen: true,
          contents: [{ text: 'SF' }],
        },
        {
          row: 23,
          column: 71,
          fieldProtected: true,
          fieldDisplay: true,
          contents: [{ text: '        ' }],
        },
      ],
    },
  ];

  const mockCorrectFlattenedZos3270TerminalData: any = [
    { id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', ScreenNumber: 101 },
  ];

  const mockCorrectAllImageData: any = [
    {
      id: 'IYK2ZNB5_1-101',
      imageFields: [
        {
          row: 0,
          column: 0,
          text: ' INQUIRE PROGRAM(NONEX)                                                       ',
        },
        { row: 0, column: 79, text: ' ' },
        { row: 1, column: 1, text: 'STATUS: ' },
        {
          row: 1,
          column: 10,
          text: 'RESULTS - OVERTYPE TO MODIFY                                         ',
        },
        { row: 2, column: 0, text: ' ' },
        { row: 2, column: 2, text: 'Prog(NONEX   )' },
        { row: 2, column: 17, text: '                ' },
        { row: 2, column: 34, text: '   ' },
        { row: 2, column: 38, text: '   ' },
        { row: 2, column: 42, text: '   ' },
        { row: 2, column: 46, text: '   ' },
        { row: 2, column: 50, text: '   ' },
        { row: 2, column: 54, text: '   ' },
        { row: 2, column: 58, text: '   ' },
        {
          row: 2,
          column: 62,
          text: 'NOT FOUND                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             ',
        },
        { row: 21, column: 53, text: 'SYSID=CICS' },
        { row: 21, column: 64, text: 'APPLID=IYK2ZNB5  ' },
        { row: 22, column: 2, text: 'RESPONSE:' },
        { row: 22, column: 12, text: '1 ERROR                            ' },
        { row: 22, column: 48, text: 'TIME: 07.01.16  DATE: 08/05/25 ' },
        { row: 23, column: 0, text: 'PF' },
        { row: 23, column: 3, text: '1' },
        { row: 23, column: 5, text: 'HELP' },
        { row: 23, column: 10, text: '     ' },
        { row: 23, column: 16, text: '3' },
        { row: 23, column: 18, text: 'END' },
        { row: 23, column: 22, text: '     ' },
        { row: 23, column: 28, text: '5' },
        { row: 23, column: 30, text: 'VAR' },
        { row: 23, column: 34, text: '      ' },
        { row: 23, column: 41, text: '7' },
        { row: 23, column: 43, text: 'SBH' },
        { row: 23, column: 47, text: '8' },
        { row: 23, column: 49, text: 'SFH' },
        { row: 23, column: 53, text: '9' },
        { row: 23, column: 55, text: 'MSG' },
        { row: 23, column: 59, text: '10' },
        { row: 23, column: 62, text: 'SB' },
        { row: 23, column: 65, text: '11' },
        { row: 23, column: 68, text: 'SF' },
        { row: 23, column: 71, text: '        ' },
      ],
    },
  ];

  beforeEach(() => {
    flattenedZos3270TerminalData.length = 0;
    allImageData.length = 0;
  });

  test('should handle images with an empty fields array', () => {
    const emptyFieldsImage = [
      {
        id: 'image-4',
        fields: [],
      },
    ];

    populateFlattenedZos3270TerminalDataAndAllImageData(emptyFieldsImage);

    // The function should still push a valid object with an empty imageFields array.
    expect(allImageData).toEqual([
      {
        id: 'image-4',
        imageFields: [],
      },
    ]);

    // The terminal data should also be populated correctly.
    expect(flattenedZos3270TerminalData).toEqual([
      {
        id: 'image-4',
        Terminal: 'image',
        ScreenNumber: 4,
      },
    ]);
  });

  test('should filter out empty row and column fields within image fields', () => {
    const mockImagesWithoutRowAndColumn: any = [
      {
        sequence: 1,
        id: 'Terminal_Test-1',
        imageSize: { columns: 80, rows: 24 },
        cursorColumn: 25,
        cursorRow: 1,
        aid: 'PF9',
        fields: [
          {
            row: null,
            column: null,
            fieldIntenseDisplay: true,
            fieldSelectorPen: true,
            contents: [{ text: 'TEST TEXT 1' }],
          },
          {
            row: 0,
            column: 79,
            fieldProtected: true,
            fieldIntenseDisplay: true,
            fieldSelectorPen: true,
            contents: [{ text: 'TEST TEXT 2' }],
          },
        ],
      },
    ];

    populateFlattenedZos3270TerminalDataAndAllImageData(mockImagesWithoutRowAndColumn);

    // The function should still push the valid imageFields.
    expect(allImageData).toEqual([
      {
        id: 'Terminal_Test-1',
        imageFields: [{ row: 0, column: 79, text: 'TEST TEXT 2' }],
      },
    ]);
  });

  test('correctly populates flattenedZos3270TerminalData and allImageData', () => {
    populateFlattenedZos3270TerminalDataAndAllImageData(mockImages);

    expect(flattenedZos3270TerminalData).toEqual(mockCorrectFlattenedZos3270TerminalData);
    expect(allImageData).toEqual(mockCorrectAllImageData);
  });
});


















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
  newAllImageData: [{ id: '', imageFields: [] }]
};

const someMockData: MockData = {
  newFlattenedZos3270TerminalData: [{ id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', ScreenNumber: 1 }],
  newAllImageData: [{ id: 'IYK2ZNB5_1-101', imageFields: [{row:0, column:0, text:'Test'}] }]
};

const mockData: MockData = {
  newFlattenedZos3270TerminalData: [{ id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', ScreenNumber: 1 }, { id: 'IYK2ZNB5_2-101', Terminal: 'IYK2ZNB5_2', ScreenNumber: 1 }],
  newAllImageData: [{ id: 'IYK2ZNB5_1-101', imageFields: [{row:0, column:0, text:'Test'}]}, { id: 'IYK2ZNB5_2-101', imageFields: [{row:0, column:0, text:'Test'}] }]

  
};

describe('TableOfScreenshots', () => {

  test('shows loading state when isLoading is true', () => {
    // Act
    mockGet3270Screenshots.mockResolvedValue(emptyMockData);

    render(
      <TableOfScreenshots isLoading={true} setIsLoading={jest.fn()} setImageData={jest.fn()} {...defaultProps} />
    );

    // Assert: Check if the loading state is displayed
    expect(screen.getByTestId('loading-table-skeleton')).toBeInTheDocument();
  });
  
  test('fetches data then sets isLoading to false', async () => {
    // Act
    const setIsLoading = jest.fn();

    mockGet3270Screenshots.mockResolvedValue(someMockData);

    await act(async () => {
      render(
        <TableOfScreenshots isLoading={true} setIsLoading={setIsLoading} setImageData={jest.fn()} {...defaultProps} />
      );
    });

    // Assert
    expect(mockGet3270Screenshots).toHaveBeenCalledWith([], 'testRunId');
    expect(setIsLoading).toHaveBeenCalledWith(false);
  });

  test('rowClick updates imageData on click', async () => { 
    const setImageData = jest.fn();

    mockGet3270Screenshots.mockResolvedValue(someMockData);

    const user = userEvent.setup();

    await act(async () => {
      render(
        <TableOfScreenshots isLoading={false} setIsLoading={jest.fn()} setImageData={setImageData} {...defaultProps} />
      );
    });

    const rowClickElement = await screen.findByTestId("table-row");

    await user.click(rowClickElement);

    expect(setImageData).toHaveBeenCalledWith({"id": "IYK2ZNB5_1-101", "imageFields": [{"column": 0, "row": 0, "text": "Test"}]});
  });


  test('renders search input and updates filtered rows', async () => { 
    // const user = userEvent.setup();

    mockGet3270Screenshots.mockResolvedValue(mockData);

    await act(async () => {
      render(
        <TableOfScreenshots isLoading={false} setIsLoading={jest.fn()} setImageData={jest.fn()} {...defaultProps} />
      );
    });

    // const searchInput = await screen.findByRole('searchbox');
    const searchInputField = await screen.findByTestId('search-input');

    await userEvent.type(screen.getByTestId('search-input'), 'IYK2ZNB5_1')

    screen.debug();
    
    expect(screen.getByTestId('search-input')).toHaveValue('IYK2ZNB5_1')

    expect(await screen.findByText('IYK2ZNB5_1')).toBeInTheDocument();
    expect(screen.queryByText('IYK2ZNB5_2')).not.toBeInTheDocument();

  });






  // test('renders dropdown for terminal selection', async () => {
  //   mockGet3270Screenshots.mockResolvedValue({
  //     newFlattenedZos3270TerminalData: [],
  //     newAllImageData: [],
  //   });

  //   // Act
  //   mockGet3270Screenshots.mockResolvedValue(emptyMockData);

  //   await act(async () => {
  //     render(
  //       <TableOfScreenshots isLoading={true} setIsLoading={jest.fn()} setImageData={jest.fn()} {...defaultProps} />
  //     );
  //   });

  //   expect(await screen.findByTestId('terminal-input')).toBeInTheDocument();
  // });
});
