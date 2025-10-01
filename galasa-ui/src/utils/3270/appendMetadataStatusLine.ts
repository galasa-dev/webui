/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';

export function appendMetadataStatusLine(
  columns: number,
  rows: number,
  characterArray: (TerminalImageCharacter | null)[][],
  imageId: string,
  inbound: boolean | undefined,
  aid: string | undefined
) {
  let inboundOrOutboundText = '',
    aidKeyText = '';

  inboundOrOutboundText = inbound ? ' - Inbound' : ' - Outbound';

  if (aid !== undefined) {
    aidKeyText = ' - ' + aid;
  }

  const metadataStatusLine =
    imageId + ' - ' + columns + 'x' + rows + inboundOrOutboundText + aidKeyText;

  // Determine number of extra rows with a line of padding and wraparound.
  let numberOfNewRows = 2 + Math.floor(metadataStatusLine.length / columns);

  // If it is perfectly divisible, then remove the extra row.
  if (metadataStatusLine.length % columns === 0) {
    numberOfNewRows--;
  }
  console.log('numberOfNewRows ' + numberOfNewRows);
  const newRows: (TerminalImageCharacter | null)[][] = Array.from({ length: numberOfNewRows }, () =>
    Array(columns).fill(null)
  );

  let charRow = 1;
  let charColumn = 0;

  for (let charIndex = 0; charIndex < metadataStatusLine.length; charIndex++) {
    const statusLineCharacter: TerminalImageCharacter = {
      character: metadataStatusLine.charAt(charIndex),
    };

    newRows[charRow][charColumn] = statusLineCharacter;

    // Increment column number, then check if the text needs to wrap around to the next row.
    charColumn++;
    if (charColumn >= columns) {
      charColumn = 0;
      charRow++;
    }
  }

  characterArray.push(...newRows);
}
