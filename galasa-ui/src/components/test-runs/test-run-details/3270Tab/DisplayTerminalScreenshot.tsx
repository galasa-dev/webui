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
  
  // Create image.
  useEffect(() => {
    if (arrayOfImageCharacters){
      const canvas = canvasRef.current;
      if (canvas) {
        generateImage(canvas, arrayOfImageCharacters);
      }
    }
  }, [arrayOfImageCharacters]);

  if (isLoading) {
    return <SkeletonPlaceholder className={styles.skeletonScreenshot} />;
  }

  return (
    <canvas className={styles.screenshot} id="canvas" ref={canvasRef}/>
  );
}
