/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useState, useEffect } from 'react';
import { SkeletonPlaceholder } from '@carbon/react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TerminalImage } from '@/utils/interfaces/3270Terminal';
import getArrayOfImageCharacters from '@/utils/3270/getArrayOfImageCharacters';


export default function DisplayTerminalScreenshot({
  imageData,
  isLoading,
}: {
  imageData: TerminalImage | undefined;
  isLoading: boolean;
}) {
  // Check output of getArrayOfIMageCharacters()
  // useEffect(() => {
  //   if (imageData){
  //     console.log("HELLO " + JSON.stringify(getArrayOfImageCharacters(imageData)));
  //     console.log("HELLO2 " + JSON.stringify(imageData));
  //   }
  // }, [imageData]);

  return(
    <img
      className={styles.screenshot}
      src={`/static/example-terminal-screenshot.png`}
      alt="Placeholder image"
    />
  );
}


  // Possible use of ImageRenderer ---------------------------------------------------------------
  // import { ImageRenderer } from '/Users/james/GitHub/Galasa/webui/galasa-ui/src/utils/3270/screenshotRenderer';

  // const [imageBuffer, setImageBuffer] = useState<Buffer | null>(null);

  // useEffect(() => {
  //   const renderer = new ImageRenderer();
  //   (async () => {
  //     await renderer.initRendererFonts();
  //     const imgBuffer = await renderer.renderTerminalImage(imageData);
  //     setImageBuffer(imgBuffer);
  //   })();
  // }, [imageData]);

  // if (isLoading) {
  //   return <SkeletonPlaceholder className={styles.skeletonScreenshot} />;
  // }

  // if (!imageBuffer) {
  //   return <div>Loading image...</div>;
  // }
  

  // return (
    // <img
    //   className={styles.screenshot}
    //   src={imageBuffer.toString()}
    //   alt="Terminal Screenshot"
    // />
  // )
  // ----------------------------------------------------------------------------------------------