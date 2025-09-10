/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useState } from 'react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TerminalImage } from '@/utils/interfaces/3270Terminal';
import { ChevronRight, ChevronLeft, CloudDownload } from '@carbon/icons-react';
import { Button, Loading } from '@carbon/react';
import { useTranslations } from 'next-intl';

export default function ScreenshotToolbar({
  setMoveImageSelection,
  cannotSwitchToPreviousImage,
  cannotSwitchToNextImage,
  highlightedRowInDisplayedData,
  isLoading,
  highlightedRowId,
}: {
  setMoveImageSelection: React.Dispatch<React.SetStateAction<number>>;
  cannotSwitchToPreviousImage: boolean;
  cannotSwitchToNextImage: boolean;
  highlightedRowInDisplayedData: boolean;
  isLoading: boolean;
  highlightedRowId: string;
}) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const translations = useTranslations('3270Tab');

  const handlePreviousImageClick = () => {
    setMoveImageSelection(-1);
  };

  const handleNextImageClick = () => {
    setMoveImageSelection(1);
  };

  // Terminal name could have a '-' in it, so need to account for an id like "third-terminal-4"
  // In that scenario, this function should return "third-terminal-00004".
  function getFileNameFromId() : string {
    const numberOfDigits = 5;   // Number of total digits after the '-'
    const parts = highlightedRowId.split('-');
    const screenNumber = parts[parts.length - 1];

    // Ensure there is a dash
    if (parts.length < 2) {
      throw new Error('Invalid terminal ID or screen number');
    }

    let screenNumberWithPadding = parts[parts.length - 1];
    if (screenNumber.length <= numberOfDigits){
      screenNumberWithPadding = '0'.repeat(numberOfDigits - screenNumber.length) + screenNumberWithPadding;
    }    

    // Rejoin all parts up to the last one, in case the terminal name has a '-' in it.
    const terminalName = parts.slice(0, -1).join('-');
    return terminalName + '-' + screenNumberWithPadding;
  }

  const handleDownloadImage = () => { 
    var link = document.createElement('a');
    link.download = getFileNameFromId() + '.jpeg';
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className={styles.screenshotToolbar}>
      <Button
        id={styles.previousImageButton}
        onClick={handlePreviousImageClick}
        kind="ghost"
        hasIconOnly
        renderIcon={ChevronLeft}
        disabled={cannotSwitchToPreviousImage || !highlightedRowInDisplayedData || isLoading}
        iconDescription={translations('previousImage')}
      />

      <Button
        id={styles.nextImageButton}
        onClick={handleNextImageClick}
        kind="ghost"
        hasIconOnly
        renderIcon={ChevronRight}
        disabled={cannotSwitchToNextImage || !highlightedRowInDisplayedData || isLoading}
        iconDescription={translations('nextImage')}
      />

      <div className={styles.downloadButtonWrapper}>
        <Button
          id={styles.downloadImageButton}
          onClick={handleDownloadImage}
          renderIcon={isDownloading ? () => <Loading small withOverlay={false} /> : CloudDownload}
          kind="ghost"
          hasIconOnly
          disabled={isLoading}
          iconDescription={
            isDownloading ? translations('downloading') : translations('downloadImage')
          }
        />
      </div>
    </div>
  );
}
