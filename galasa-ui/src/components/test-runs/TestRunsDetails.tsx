/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import BreadCrumb from '@/components/common/BreadCrumb';
import TestRunsTabs from '@/components/test-runs/TestRunsTabs';
import styles from '@/styles/test-runs/TestRunsPage.module.css';
import { Suspense, useState } from 'react';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { useTranslations } from 'next-intl';
import { NotificationType } from '@/utils/types/common';
import { Button } from '@carbon/react';
import { Share } from '@carbon/icons-react';
import { InlineNotification } from '@carbon/react';
import PageTile from '../PageTile';

interface TestRunsDetailsProps {
  requestorNamesPromise: Promise<string[]>;
  resultsNamesPromise: Promise<string[]>;
}

export default function TestRunsDetails({
  requestorNamesPromise,
  resultsNamesPromise,
}: TestRunsDetailsProps) {
  const { breadCrumbItems } = useHistoryBreadCrumbs();
  const translations = useTranslations('TestRunsDetails');

  const [notification, setNotification] = useState<NotificationType | null>(null);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotification({
        kind: 'success',
        title: translations('copiedTitle'),
        subtitle: translations('copiedMessage'),
      });

      // Hide notification after 6 seconds
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      console.error('Failed to copy:', err);
      setNotification({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('copyFailedMessage'),
      });
    }
  };

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={breadCrumbItems} />
      <PageTile translationKey="TestRun.title" className={styles.toolbar}>
        <div className={styles.toolbarActions}>
          <Button
            kind="ghost"
            hasIconOnly
            renderIcon={Share}
            iconDescription={translations('copyMessage')}
            onClick={handleShare}
            data-testid="share-button"
          />
        </div>
      </PageTile>
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
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs
            requestorNamesPromise={requestorNamesPromise}
            resultsNamesPromise={resultsNamesPromise}
          />
        </Suspense>
      </div>
    </main>
  );
}
