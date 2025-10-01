/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {
  TerminalImage,
  TerminalImageCharacter,
} from '@/utils/interfaces/3270Terminal';
import { appendImageDataToCharacterArray } from '@/utils/3270/appendImageDataToCharacterArray';
import { appendMetadataStatusLine } from '@/utils/3270/appendMetadataStatusLine';


// Return a 2D array of characters, with each character representing all properties of its parent TerminalImageField.
export default function getArrayOfImageCharacters(
  imageData: TerminalImage
): (TerminalImageCharacter | null)[][] {
  const rows = imageData.imageSize.rows;
  const columns = imageData.imageSize.columns;

  // Initialise array with nulls.
  const characterArray: (TerminalImageCharacter | null)[][] = Array.from({ length: rows }, () =>
    Array(columns).fill(null)
  );

  appendImageDataToCharacterArray(imageData, rows, columns, characterArray)

  appendMetadataStatusLine(columns, rows, characterArray, imageData.id, imageData.inbound, imageData.aid);



  // TODO: Append cursor - after the backend is fixed as currently the cursor row and column are the wrong way round.

  // const cursorRow = imageData.cursorRow;
  // const cursorColumn = imageData.cursorColumn;

  // if (cursorRow && cursorColumn) {

  //   if (cursorRow < rows && cursorColumn < columns) {
  //     if (characterArray[cursorRow][cursorColumn]) {
  //       characterArray[cursorRow][cursorColumn].cursor = true;
  //     } else {
  //       characterArray[cursorRow][cursorColumn] = { character: '', cursor: true };
  //     }
  //   }
  // }

  return characterArray;
}
