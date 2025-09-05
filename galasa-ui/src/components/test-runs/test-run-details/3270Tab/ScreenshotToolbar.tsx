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
}: {
  setMoveImageSelection: React.Dispatch<React.SetStateAction<number>>;
  cannotSwitchToPreviousImage: boolean;
  cannotSwitchToNextImage: boolean;
  highlightedRowInDisplayedData: boolean;
  isLoading: boolean;
}) {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const translations = useTranslations('3270Tab');

  const handlePreviousImageClick = () => {
    setMoveImageSelection(-1);
  };

  const handleNextImageClick = () => {
    setMoveImageSelection(1);
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
