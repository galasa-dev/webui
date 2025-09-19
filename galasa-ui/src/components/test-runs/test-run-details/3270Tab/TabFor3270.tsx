/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useEffect, useState } from 'react';
import TableOfScreenshots from '@/components/test-runs/test-run-details/3270Tab/TableOfScreenshots';
import DisplayTerminalScreenshot from '@/components/test-runs/test-run-details/3270Tab/DisplayTerminalScreenshot';
import ScreenshotToolbar from '@/components/test-runs/test-run-details/3270Tab/ScreenshotToolbar';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TreeNodeData } from '@/utils/functions/artifacts';
import ErrorPage from '@/app/error/page';
import { TerminalImage } from '@/utils/interfaces/3270Terminal';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'next/navigation';


export default function TabFor3270({
  runId,
  zos3270TerminalData,
  is3270CurrentlySelected,
}: {
  runId: string;
  zos3270TerminalData: TreeNodeData[];
  is3270CurrentlySelected: boolean;
}) {
  const router = useRouter();
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

  // Change the URL whenever the highlighted (selected) image or filters change.
  useEffect(() => {
    const updatedUrl = new URL(window.location.href);

    if (updatedUrl.searchParams.get('tab') === '3270') {
      if (updatedUrl.searchParams.has('terminalScreen')) {
        updatedUrl.searchParams.set('terminalScreen', highlightedRowId);
      } else {
        updatedUrl.searchParams.append('terminalScreen', highlightedRowId);
      }
    }

    // Update the router state with the new URL
    router.replace(updatedUrl.toString(), { scroll: false });
  }, [highlightedRowId, is3270CurrentlySelected])

  useEffect(() => {
    const url = new URL(window.location.href);
    const terminalScreenIdPresent = url.searchParams.has('terminalScreen');

    if (is3270CurrentlySelected) {
      if (highlightedRowId === '' && terminalScreenIdPresent) {
        setHighlightedRowId(url.searchParams.get('terminalScreen') || '');
      }
    } else {
      // Cleanup 'terminalScreen' parameter if they switch off of the 3270 tab.

      if (terminalScreenIdPresent) {
        url.searchParams.delete('terminalScreen');
        router.replace( url.toString(), { scroll: false });
      }
    }
  }, [is3270CurrentlySelected])

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
