/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import {
  populateFlattenedZos3270TerminalDataAndAllImageData,
  splitScreenAndTerminal,
  flattenedZos3270TerminalData,
  allImageData,
} from '@/utils/3270/get3270Screenshots';

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
    { id: 'IYK2ZNB5_1-101', Terminal: 'IYK2ZNB5_1', screenNumber: 101 },
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
    // Act
    const emptyFieldsImage = [
      {
        id: 'image-4',
        fields: [],
      },
    ];

    populateFlattenedZos3270TerminalDataAndAllImageData(emptyFieldsImage);

    // Assert

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
        screenNumber: 4,
      },
    ]);
  });

  test('should filter out empty row and column fields within image fields', () => {
    // Act
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

    // Assert
    expect(allImageData).toEqual([
      {
        id: 'Terminal_Test-1',
        imageFields: [{ row: 0, column: 79, text: 'TEST TEXT 2' }],
      },
    ]);
  });

  test('correctly populates flattenedZos3270TerminalData and allImageData', () => {
    // Act
    populateFlattenedZos3270TerminalDataAndAllImageData(mockImages);

    // Assert
    expect(flattenedZos3270TerminalData).toEqual(mockCorrectFlattenedZos3270TerminalData);
    expect(allImageData).toEqual(mockCorrectAllImageData);
  });
});
