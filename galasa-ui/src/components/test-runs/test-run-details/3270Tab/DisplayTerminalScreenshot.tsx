/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useRef, useState, useEffect } from 'react';
import { SkeletonPlaceholder } from '@carbon/react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TerminalImage, TerminalImageCharacter } from '@/utils/interfaces/3270Terminal';
import getArrayOfImageCharacters from '@/utils/3270/getArrayOfImageCharacters';
import { generateImage } from '@/utils/3270/screenshotRenderer';

export default function DisplayTerminalScreenshot({
  imageData,
  isLoading,
}: {
  imageData: TerminalImage | undefined;
  isLoading: boolean;
}) {

  const [arrayOfImageCharacters, setArrayOfImageCharacters] = useState<(TerminalImageCharacter | null)[][]>();

  useEffect(() => {
    if (imageData){
      setArrayOfImageCharacters(getArrayOfImageCharacters(imageData));
    }
  }, [imageData]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Draw the grid whenever the gridData changes
  useEffect(() => {
    if (arrayOfImageCharacters){
      const canvas = canvasRef.current;
      if (canvas) {
        generateImage(canvas, arrayOfImageCharacters);
      }
    }
  }, [arrayOfImageCharacters]);

  const handleDownloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary link and trigger a download
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = '3270-screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <SkeletonPlaceholder className={styles.skeletonScreenshot} />;
  }

  return (
    <div>
      <canvas ref={canvasRef} className={styles.screenshot}></canvas>
    </div>
  );
}
