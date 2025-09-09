/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';

export const generateImage = (
  canvas: HTMLCanvasElement,
  gridData: (TerminalImageCharacter | null)[][]
): void => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const rows = gridData.length;
  const columns = gridData[0].length;

  // To alter font size, change the cell height.
  const cellHeight = 14;
  const verticalCharacterPadding = 2;
  const horizontalCharacterPadding = 2;
  const imagePadding = 10;
 
  const font = (cellHeight-verticalCharacterPadding) + "px Inter, monospace";
  ctx.font = font;
  const characterWidth = ctx.measureText('W').width;

  const rowWidth = (characterWidth + horizontalCharacterPadding) * columns;

  canvas.width = rowWidth + imagePadding;
  canvas.height = rows * cellHeight + imagePadding;

  // Set image background colour to black.
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = font;
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#00FF00'; // Character colour
  ctx.lineWidth = 1.5;

  // Draw the characters
  let y = 5 + cellHeight / 2;
  gridData.forEach(row => {
    let x = 5;
    row.forEach(characterCell => {
      if (characterCell) {
        ctx.fillText(characterCell.character, x, y);

        // TODO: Extra image fields to be handled here

      }
      x += characterWidth + horizontalCharacterPadding;
    });
    // Move to the next row
    y += cellHeight;
  });
};
