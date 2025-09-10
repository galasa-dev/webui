/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useState } from 'react';
import TableOfScreenshots from '@/components/test-runs/test-run-details/3270Tab/TableOfScreenshots';
import DisplayTerminalScreenshot from '@/components/test-runs/test-run-details/3270Tab/DisplayTerminalScreenshot';
import ScreenshotToolbar from '@/components/test-runs/test-run-details/3270Tab/ScreenshotToolbar';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TreeNodeData } from '@/utils/functions/artifacts';
import ErrorPage from '@/app/error/page';
import { TerminalImage } from '@/utils/interfaces/3270Terminal';
import { useTheme } from '@/contexts/ThemeContext';

export default function TabFor3270({
  runId,
  zos3270TerminalData,
}: {
  runId: string;
  zos3270TerminalData: TreeNodeData[];
}) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState<TerminalImage>();
  const [moveImageSelection, setMoveImageSelection] = useState<number>(0);
  const [cannotSwitchToPreviousImage, setCannotSwitchToPreviousImage] = useState<boolean>(true);
  const [cannotSwitchToNextImage, setCannotSwitchToNextImage] = useState<boolean>(false);
  const [highlightedRowId, setHighlightedRowId] = useState<string>('');
  const [highlightedRowInDisplayedData, setHighlightedRowInDisplayedData] = useState<boolean>(true);

  const current = useTheme().theme;
  let theme: 'light' | 'dark';
  if (current === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    } else {
      theme = 'light';
    }
  } else {
    theme = current;
  }

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <div
      className={`${styles.tab3270Container} ${theme === 'light' ? styles.lightTheme : styles.darkTheme}`}
    >
      <div className={styles.tableOfScreenshotsContainer}>
        <TableOfScreenshots
          runId={runId}
          zos3270TerminalData={zos3270TerminalData}
          isLoading={isLoading}
          setIsError={setIsError}
          setIsLoading={setIsLoading}
          setImageData={setImageData}
          moveImageSelection={moveImageSelection}
          setMoveImageSelection={setMoveImageSelection}
          setCannotSwitchToPreviousImage={setCannotSwitchToPreviousImage}
          setCannotSwitchToNextImage={setCannotSwitchToNextImage}
          highlightedRowInDisplayedData={highlightedRowInDisplayedData}
          setHighlightedRowInDisplayedData={setHighlightedRowInDisplayedData}
          highlightedRowId={highlightedRowId}
          setHighlightedRowId={setHighlightedRowId}
        />
      </div>

      <div className={styles.screenshotContainer}>
        <ScreenshotToolbar
          setMoveImageSelection={setMoveImageSelection}
          cannotSwitchToPreviousImage={cannotSwitchToPreviousImage}
          cannotSwitchToNextImage={cannotSwitchToNextImage}
          highlightedRowInDisplayedData={highlightedRowInDisplayedData}
          isLoading={isLoading}
          highlightedRowId={highlightedRowId}
        />
        <DisplayTerminalScreenshot imageData={imageData} isLoading={isLoading} />
      </div>
    </div>
  );
}
