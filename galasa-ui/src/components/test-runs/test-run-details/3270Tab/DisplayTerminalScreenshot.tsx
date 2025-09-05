/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useState, useEffect } from 'react';
import { SkeletonPlaceholder } from '@carbon/react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { ImageRenderer } from '/Users/james/GitHub/Galasa/webui/galasa-ui/src/utils/3270/screenshotRenderer';
import { TerminalImage } from '@/utils/interfaces/3270Terminal';

export default function DisplayTerminalScreenshot({
  imageData,
  isLoading,
}: {
  imageData: TerminalImage;
  isLoading: boolean;
}) {
  const [imageBuffer, setImageBuffer] = useState<Buffer | null>(null);

  useEffect(() => {
    const renderer = new ImageRenderer();
    (async () => {
      await renderer.initRendererFonts();
      const imgBuffer = await renderer.renderTerminalImage(imageData);
      setImageBuffer(imgBuffer);
    })();
  }, [imageData]);

  if (isLoading) {
    return <SkeletonPlaceholder className={styles.skeletonScreenshot} />;
  }

  if (!imageBuffer) {
    return <div>Loading image...</div>; // Or show a loading indicator
  }

  return (
    <img
      className={styles.screenshot}
      src={imageBuffer.toString()}
      alt="Terminal Screenshot"
    />
  );
}
