/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { downloadArtifactFromServer } from '@/actions/runsAction';
import { FileNode, TreeNodeData } from '@/utils/functions/artifacts';
import { CellFor3270 } from '@/utils/interfaces/common';
import pako from 'pako';

const rawData: CellFor3270[] = [];

function splitScreenAndTerminal(input: string) {
  const parts = input.split('-');

  const screenNumber = parseInt(parts[parts.length - 1], 10);

  // Rejoin all parts before the last one, just in case the terminal name had a '-' in it.
  const terminalName = parts.slice(0, -1).join('-');

  return {
    screenNumber,
    terminalName,
  };
}

export const get3270Screenshots = async (
  zos3270TerminalData: TreeNodeData[],
  runId: string,
  setIsError: React.Dispatch<React.SetStateAction<boolean>>
) => {
  for (var terminal of zos3270TerminalData) {
    const zippedFilesContainingImageJSON: FileNode[] = Object.values(terminal.children)
      .filter((node) => (node as FileNode).isFile)
      .map((node) => node as FileNode);

    for (var file of zippedFilesContainingImageJSON) {
      await downloadArtifactFromServer(runId, file.url)
        .then((artifactData) => {
          // Unzip the content
          // 1. Convert the base64 string to a Uint8Array.
          const gzippedBinaryString = atob(artifactData.base64);
          const gzippedUint8Array = new Uint8Array(gzippedBinaryString.length);
          for (let i = 0; i < gzippedBinaryString.length; i++) {
            gzippedUint8Array[i] = gzippedBinaryString.charCodeAt(i);
          }

          // 2. Decompress the Uint8Array using pako.
          const decompressedUint8Array = pako.inflate(gzippedUint8Array);

          // 3. Convert the decompressed Uint8Array back to a string.
          const resultString: any = JSON.parse(new TextDecoder().decode(decompressedUint8Array));

          const images = resultString.images;

          images.forEach((image: any) => {
            // Example image id: "term1-33"
            const id = image.id;
            const result = splitScreenAndTerminal(id);
            const method = 'Method A'; // TODO 3270:          Placeholder - needed from backend.
            const time = '2023-01-01 12:00:00'; // TODO 3270: Placeholder - needed from backend.

            rawData.push({
              id: image.id,
              Terminal: result.terminalName,
              ScreenNumber: result.screenNumber,
              Time: time,
              Method: method,
            });
          });
        })
        .catch((error) => {
          console.error('Error downloading artifact: ', error);
          setIsError(true); // Add this line to set the error state
        });
    }
  }

  // Sort according to terminal, then screen number.
  rawData.sort(function (a, b) {
    if (a.Terminal === b.Terminal) {
      return a.ScreenNumber - b.ScreenNumber;
    }
    return a.Terminal > b.Terminal ? 1 : -1;
  });

  return rawData;
};
