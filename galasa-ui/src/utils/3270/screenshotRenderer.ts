// /*
//  * Copyright contributors to the Galasa project
//  *
//  * SPDX-License-Identifier: EPL-2.0
//  */
// // Assisted by watsonx Code Assistant

// import { TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';

// export default function TerminalImageRenderer(characterArray: (TerminalImageCharacter | null)[][]) : Promise<Blob> {
//   const renderCharacter = async (char: TerminalImageCharacter | null, row: number, col: number) => {
//     if (char && char.character) {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (ctx) {
//         const fontSize = 12;
//         const charWidth = ctx.measureText(char.character).width;
//         const charHeight = fontSize;

//         canvas.width = charWidth;
//         canvas.height = charHeight;
//         ctx.fillStyle = 'green';
//         ctx.font = `monospace ${fontSize}px`;
//         ctx.fillText(char.character, 0, 0);

//         const imageBitmap = await createImageBitmap(canvas);
//         return imageBitmap;
//       } else {
//         return null;
//       }
//     }
//     return null;
//   };

//   const imageBitmapList: ImageBitmap[] = [];

//   async function renderImage() {
//     characterArray.forEach(async (row, rowIndex) => {
//       row.forEach(async (cell, colIndex) => {
//         const imageBitmap = await renderCharacter(cell, rowIndex, colIndex);
//         if (imageBitmap) {
//           imageBitmapList.push(imageBitmap);
//         }
//       });
//     });

//     const combinedImageBitmap = createCombinedImageBitmap(imageBitmapList);
//   }

//   // const handleDownload = () => {
//   //   const blob = await combinedImageBitmap.toBlob();
//   //   const url = URL.createObjectURL(blob);
//   //   const a = document.createElement('a');
//   //   a.style.display = 'none';
//   //   a.href = url;
//   //   a.download = 'terminal_image.jpeg';
//   //   a.click();
//   //   window.URL.revokeObjectURL(url);
//   // };
// }

// const createCombinedImageBitmap = (imageBitmaps: ImageBitmap[]): ImageBitmap => {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d');
//   const totalWidth = imageBitmaps.reduce((acc, curr) => acc + curr.width, 0);
//   const totalHeight = imageBitmaps.length;

//   canvas.width = totalWidth;
//   canvas.height = totalHeight;

//   imageBitmaps.forEach((bitmap, index) => {
//     const x = index * bitmap.width;
//     if (ctx) {
//       ctx.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height, x, 0, bitmap.width, bitmap.height);
//     }
//   });

//   return createImageBitmap(canvas);
// };
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react';
import { TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';

export default function TerminalImageRenderer(
  characterArray: (TerminalImageCharacter | null)[][]
): Promise<Blob> {
  const renderCharacter = async (
    char: TerminalImageCharacter | null,
    row: number,
    col: number
  ): Promise<ImageBitmap | null> => {
    if (char && char.character) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const fontSize = 12;
        const charWidth = ctx.measureText(char.character).width;
        const charHeight = fontSize;

        canvas.width = charWidth;
        canvas.height = charHeight;
        ctx.fillStyle = 'green';
        ctx.font = `monospace ${fontSize}px`;
        ctx.fillText(char.character, 0, 0);

        const imageBitmap = await createImageBitmap(canvas);
        return imageBitmap;
      } else {
        return null;
      }
    }
    return null;
  };

  const imageBitmapList: Promise<ImageBitmap>[] = [];

  async function renderImage() {
    characterArray.forEach(async (row, rowIndex) => {
      row.forEach(async (cell, colIndex) => {
        const imageBitmap = await renderCharacter(cell, rowIndex, colIndex);
        if (imageBitmap) {
          imageBitmapList.push(imageBitmap);
        }
      });
    });

    const combinedImageBitmap = await createCombinedImageBitmap(imageBitmapList);
    return combinedImageBitmap.toBlob();
  }

  return renderImage();
}

const createCombinedImageBitmap = async (
  imageBitmaps: Promise<ImageBitmap>[]
): Promise<ImageBitmap> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const totalWidth = await imageBitmaps.reduce((acc, curr) => acc + (await curr).width, 0);
  const totalHeight = imageBitmaps.length;

  canvas.width = totalWidth;
  canvas.height = totalHeight;

  let bitmapIndex = 0;
  for (const bitmapPromise of imageBitmaps) {
    const bitmap = await bitmapPromise;
    if (ctx) {
      ctx.drawImage(
        bitmap,
        0,
        0,
        bitmap.width,
        bitmap.height,
        bitmapIndex * bitmap.width,
        0,
        bitmap.width,
        bitmap.height
      );
      bitmapIndex++;
    }
  }

  return createImageBitmap(canvas);
};
