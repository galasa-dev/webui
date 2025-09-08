/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {
  TerminalImage,
  TerminalImageField,
  TerminalImageCharacter,
} from '@/utils/interfaces/3270Terminal';

// Return a 2D array of characters, with each character representing all properties of its parent TerminalImageField.
export default function getArrayOfImageCharacters(imageData: TerminalImage): (TerminalImageCharacter | null)[][] {
  const rows = imageData.imageSize.rows;
  const columns = imageData.imageSize.columns;
  // Initialise array with nulls.
  const characterArray: (TerminalImageCharacter | null)[][] = Array.from({length: rows}, () => Array(columns).fill(null));

  imageData.fields.forEach(function (imageField: TerminalImageField) {
    // Skip over an empty contents field, or one without any text
    if (Array.isArray(imageField.contents) && imageField.contents.length > 0 && (imageField.contents[0].text || imageField.contents[0].characters)) {
      // Get image text by first checking the "text" field, then "characters" (must join() as it is type string[]), otherwise null.
      const imageText: string | null = imageField.contents[0].text
        ? imageField.contents[0].text
        : imageField.contents[0].characters
          ? imageField.contents[0].characters.join('')
          : null;

      if (imageText && imageText.length > 0) {
        let charRow = imageField.row;
        let charColumnWithWraparound = imageField.column;
        for (let charIndex = 0; charIndex < imageText.length; charIndex++) {
          const {row, column, contents, ...rawTerminalImageFieldDetails} = imageField;
          
          // Ensure terminalImageFieldDetails is an object
          const terminalImageFieldDetails = rawTerminalImageFieldDetails || {};

          const terminalImageCharacter: TerminalImageCharacter = {
            character: imageText.charAt(charIndex),
            ...terminalImageFieldDetails
          };

          // Place string into character array.
          if (charRow >= rows || charRow < 0 || charColumnWithWraparound >= columns || charColumnWithWraparound < 0) {
            throw new Error('Invalid image data - image data out of bounds');
          }
          if (characterArray[charRow][charColumnWithWraparound]) {
            throw new Error('Invalid image data - image data overlapping');
          }
          characterArray[charRow][charColumnWithWraparound] = terminalImageCharacter;


          charColumnWithWraparound++;
          if (charColumnWithWraparound >= columns) {
            charColumnWithWraparound = 0;
            charRow++;
          }
        }
      }
    }
  });

  return characterArray;
}
