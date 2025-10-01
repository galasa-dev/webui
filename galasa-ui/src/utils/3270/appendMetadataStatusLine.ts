/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {
  TerminalImageCharacter,
} from '@/utils/interfaces/3270Terminal';


export function appendMetadataStatusLine(columns: number, rows: number, characterArray: (TerminalImageCharacter | null)[][], imageId: string, inbound: boolean | undefined, aid: string | undefined) {
  // Append 3 rows to the character array for the status line with padding.
  const newRows: (TerminalImageCharacter | null)[][] = Array.from({ length: 3 }, () => Array(columns).fill(null));

  let inboundOrOutboundText = '', aidKeyText = '';
  
  inboundOrOutboundText = inbound ? ' - Inbound' : ' - Outbound';

  if (aid !== undefined) {
    aidKeyText = ' - ' + aid;
  }

  const metadataStatusLine = imageId + ' - ' + columns + 'x' + rows + inboundOrOutboundText + aidKeyText;

  for (let charIndex = 0; charIndex < metadataStatusLine.length; charIndex++) {
    const statusLineCharacter: TerminalImageCharacter = {
      character: metadataStatusLine.charAt(charIndex),
    };

    newRows[1][charIndex] = statusLineCharacter;
  }

  characterArray.push(...newRows);
}