/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';
import {
  cellHeight,
  horizontalCharacterPadding,
  imagePadding,
  font,
  backgroundColour,
  characterColour,
} from '@/utils/constants/screenshotRenderer';

export const screenshotRenderer = (
  canvas: HTMLCanvasElement,
  gridData: (TerminalImageCharacter | null)[][],
  context: CanvasRenderingContext2D
): void => {
  let rows = 0;
  let columns = 0;

  if (gridData && gridData.length > 0) {
    rows = gridData.length;
    columns = gridData[0].length;
  }

  context.font = font;
  const characterWidth = context.measureText('W').width;

  const rowWidth = (characterWidth + horizontalCharacterPadding) * columns;

  canvas.width = rowWidth + imagePadding;
  canvas.height = rows * cellHeight + imagePadding;

  // Set image background colour to black.
  context.fillStyle = backgroundColour;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.font = font;
  context.textBaseline = 'middle';
  context.fillStyle = characterColour; // Character colour
  context.lineWidth = 1.5;

  // Draw the characters
  let y = imagePadding / 2 + cellHeight / 2;
  gridData.forEach((row) => {
    let x = imagePadding / 2;
    row.forEach((characterCell) => {
      if (characterCell) {
        context.fillText(characterCell.character, x, y);

        // TODO: Extra image fields to be handled here, such as background colour.
      }
      x += characterWidth + horizontalCharacterPadding;
    });
    // Move to the next row
    y += cellHeight;
  });
};
