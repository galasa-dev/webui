/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useState, useEffect } from 'react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { ChevronRight, ChevronLeft, Copy, CloudDownload } from '@carbon/icons-react';
import { Button, Loading, InlineNotification } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { NotificationType } from '@/utils/types/common';
import { NOTIFICATION_VISIBLE_MILLISECS } from '@/utils/constants/common';

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
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const translations = useTranslations('3270Tab');

  const handlePreviousImageClick = () => {
    setMoveImageSelection(-1);
  };

  const handleNextImageClick = () => {
    setMoveImageSelection(1);
  };

  // Terminal name could have a '-' in it, so need to account for an id like "third-terminal-4"
  // In that scenario, this function should return "third-terminal-00004".
  function getFileNameFromId(): string {
    const numberOfDigitsAfterDash = 5;
    const parts = highlightedRowId.split('-');
    const screenNumber = parts[parts.length - 1];

    // Ensure there is a dash
    if (parts.length < 2) {
      throw new Error('Invalid terminal ID or screen number');
    }

    let screenNumberWithPadding = parts[parts.length - 1];
    if (screenNumber.length <= numberOfDigitsAfterDash) {
      screenNumberWithPadding =
        '0'.repeat(numberOfDigitsAfterDash - screenNumber.length) + screenNumberWithPadding;
    }

    // Rejoin all parts up to the last one, in case the terminal name has a '-' in it.
    const terminalName = parts.slice(0, -1).join('-');
    return terminalName + '-' + screenNumberWithPadding;
  }

  const handleCopyImage = async () => {
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) {
        throw new Error('Failed to get blob from canvas.');
      }

      const item = new ClipboardItem({ 'image/png': blob });

      await navigator.clipboard.write([item]);

      setNotification({
        kind: 'success',
        title: translations('copiedTitle'),
        subtitle: translations('copiedMessage'),
      });
    } catch (err) {
      console.error('Failed to copy canvas image:', err);

      setNotification({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('copyFailedMessage'),
      });
    }
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
  };

  const handleDownloadImage = () => {
    var link = document.createElement('a');
    link.download = getFileNameFromId() + '.jpeg';
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!e.repeat) {
      switch (e.key) {
        case 'ArrowLeft':
          if (highlightedRowInDisplayedData && !cannotSwitchToPreviousImage && !isLoading) {
            handlePreviousImageClick();
          }
          break;

        case 'ArrowRight':
          if (highlightedRowInDisplayedData && !cannotSwitchToNextImage && !isLoading) {
            handleNextImageClick();
          }
          break;
      }
    }
  };

  const cleanup = () => {
    document.removeEventListener('keydown', handleKeyDown);
  };

  // Mount event listener to let users flick between screenshots with left and right arrow keys.
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return cleanup;
  }, [
    isLoading,
    highlightedRowInDisplayedData,
    cannotSwitchToPreviousImage,
    cannotSwitchToNextImage,
  ]);

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

      <Button
        onClick={handleCopyImage}
        renderIcon={Copy}
        kind="ghost"
        hasIconOnly
        disabled={isLoading}
        iconDescription={translations('copyImage')}
      />

      {notification && (
        <div className={styles.notification}>
          <InlineNotification
            title={notification.title}
            subtitle={notification.subtitle}
            kind={notification.kind}
            hideCloseButton={true}
          />
        </div>
      )}

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
  );
}
