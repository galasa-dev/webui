/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import getArrayOfImageCharacters from '@/utils/3270/getArrayOfImageCharacters';
import {
  TerminalImage,
  TerminalImageCharacter,
} from '@/utils/interfaces/3270Terminal';

// jest.mock('@/utils/3270/getArrayOfImageCharacters');

describe('getArrayOfImageCharacters', () => {
  let testData: TerminalImage;

  beforeEach(() => {
    testData = {
      id: 'testId',
      imageSize: { rows: 3, columns: 5 },
      fields: [],
    };
  });

  test('should return correct 2D array for valid input', () => {
    testData.fields.push(
      {
        row: 0,
        column: 0,
        contents: [{ text: 'AB' }],
      },
      {
        row: 1,
        column: 0,
        contents: [{ characters: ['C', 'D'] }],
      },
    );

    const expectedOutput: (TerminalImageCharacter | null)[][] = [
      [{character: 'A'}, {character: 'B'}, null, null, null],
      [{character: 'C'}, {character: 'D'}, null, null, null],
      [null, null, null, null, null],
    ];

    expect(getArrayOfImageCharacters(testData)).toEqual(expectedOutput);
  });

  test('should ignore empty contents field', () => {
    testData.fields.push({
      row: 0,
      column: 2,
      contents: [],
    });

    const expectedOutput: (TerminalImageCharacter | null)[][] = [
      [null, null, null, null, null],
      [null, null, null, null, null],
      [null, null, null, null, null],
    ];

    expect(getArrayOfImageCharacters(testData)).toEqual(expectedOutput);
  });

  test('should correctly manage wraparound when text is longer than number of columns left in row', () => {
    testData.fields.push({
      row: 1,
      column: 4,
      contents: [{ text: 'XX' }],
    });

    const expectedOutput: (TerminalImageCharacter | null)[][] = [
      [null, null, null, null, null],
      [null, null, null, null, {character: 'X'}],
      [{character: 'X'}, null, null, null, null],
    ];

    expect(getArrayOfImageCharacters(testData)).toEqual(expectedOutput);
  });

  test('should throw an error for invalid image data overlap', () => {
    testData.fields.push({
      row: 1,
      column: 4,
      contents: [{ text: 'X' }],
    });
    testData.fields.push({
      row: 1,
      column: 4,
      contents: [{ text: 'X' }],
    });
    expect(() => getArrayOfImageCharacters(testData)).toThrow('Invalid image data - image data overlapping');
  });

  test('should throw an error for out-of-bounds placement', () => {
    testData.fields.push({
      row: 2,
      column: 4,
      contents: [{ text: 'XX' }],
    });
    expect(() => getArrayOfImageCharacters(testData)).toThrow('Invalid image data - image data out of bounds');
  });
});


