/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import { appendMetadataStatusLine } from '@/utils/3270/appendMetadataStatusLine';
import { TerminalImage, TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';

describe('appendMetadataStatusLine', () => {
  const imageDataId = 'testId';

  test('status line appended normally', () => {
    const exampleCharacterArray: (TerminalImageCharacter | null)[][] = [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
    ];

    const inbound = undefined;
    const aid = undefined;

    appendMetadataStatusLine(
      exampleCharacterArray[0].length,
      exampleCharacterArray.length,
      exampleCharacterArray,
      imageDataId,
      inbound,
      aid
    );

    console.log(exampleCharacterArray);

    const expectedOutput: (TerminalImageCharacter | null)[][] = [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      ],
      [
        { character: 't' },
        { character: 'e' },
        { character: 's' },
        { character: 't' },
        { character: 'I' },
        { character: 'd' },
        { character: ' ' },
        { character: '-' },
        { character: ' ' },
        { character: '2' },
        { character: '4' },
        { character: 'x' },
        { character: '1' },
        { character: ' ' },
        { character: '-' },
        { character: ' ' },
        { character: 'O' },
        { character: 'u' },
        { character: 't' },
        { character: 'b' },
        { character: 'o' },
        { character: 'u' },
        { character: 'n' },
        { character: 'd' },
      ],
    ];

    expect(exampleCharacterArray).toEqual(expectedOutput);
  });

  test('status line wraparound', () => {
    const exampleCharacterArray: (TerminalImageCharacter | null)[][] = [
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
    ];

    const inbound = undefined;
    const aid = undefined;

    appendMetadataStatusLine(
      exampleCharacterArray[0].length,
      exampleCharacterArray.length,
      exampleCharacterArray,
      imageDataId,
      inbound,
      aid
    );

    const expectedOutput: (TerminalImageCharacter | null)[][] = [
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
      [
        { character: 't' },
        { character: 'e' },
        { character: 's' },
        { character: 't' },
        { character: 'I' },
        { character: 'd' },
        { character: ' ' },
        { character: '-' },
        { character: ' ' },
        { character: '1' },
        { character: '3' },
        { character: 'x' },
        { character: '1' },
      ],
      [
        { character: ' ' },
        { character: '-' },
        { character: ' ' },
        { character: 'O' },
        { character: 'u' },
        { character: 't' },
        { character: 'b' },
        { character: 'o' },
        { character: 'u' },
        { character: 'n' },
        { character: 'd' },
        null,
        null,
      ],
    ];

    expect(exampleCharacterArray).toEqual(expectedOutput);
  });

  // test('should ignore empty contents field', () => {
  //   testData.fields.push({
  //     row: 0,
  //     column: 2,
  //     contents: [],
  //   });

  //   const expectedOutput: (TerminalImageCharacter | null)[][] = [
  //     [null, null, null, null, null],
  //     [null, null, null, null, null],
  //     [null, null, null, null, null],
  //   ];

  //   appendImageDataToCharacterArray(testData, rows, columns, characterArray);

  //   expect(characterArray).toEqual(expectedOutput);
  // });

  // test('should correctly manage wraparound when text is longer than number of columns left in row', () => {
  //   testData.fields.push({
  //     row: 1,
  //     column: 4,
  //     contents: [{ text: 'XX' }],
  //   });

  //   const expectedOutput: (TerminalImageCharacter | null)[][] = [
  //     [null, null, null, null, null],
  //     [null, null, null, null, { character: 'X' }],
  //     [{ character: 'X' }, null, null, null, null],
  //   ];

  //   appendImageDataToCharacterArray(testData, rows, columns, characterArray);

  //   expect(characterArray).toEqual(expectedOutput);
  // });

  // test('should throw an error for invalid image data overlap', () => {
  //   testData.fields.push({
  //     row: 1,
  //     column: 4,
  //     contents: [{ text: 'X' }],
  //   });
  //   testData.fields.push({
  //     row: 1,
  //     column: 4,
  //     contents: [{ text: 'X' }],
  //   });

  //   expect(() => appendImageDataToCharacterArray(testData, rows, columns, characterArray)).toThrow(
  //     'Invalid image data - image data overlapping'
  //   );
  // });

  // test('should throw an error for out-of-bounds placement', () => {
  //   testData.fields.push({
  //     row: 2,
  //     column: 4,
  //     contents: [{ text: 'XX' }],
  //   });

  //   expect(() => appendImageDataToCharacterArray(testData, rows, columns, characterArray)).toThrow(
  //     'Invalid image data - image data out of bounds'
  //   );
  // });
});
