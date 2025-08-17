/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import BreadCrumb from '@/components/common/BreadCrumb';
import TestRunsTabs from '@/components/test-runs/TestRunsTabs';
import styles from '@/styles/test-runs/TestRunsPage.module.css';
import { Suspense, useEffect, useRef, useState } from 'react';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { useTranslations } from 'next-intl';
import { NotificationType } from '@/utils/types/common';
import { Button } from '@carbon/react';
import { Edit, Share } from '@carbon/icons-react';
import { InlineNotification } from '@carbon/react';
import PageTile from '../PageTile';
import CollapsibleSideBar from './saved-queries/CollapsibleSideBar';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import useTestRunsQueryParams from '@/hooks/useTestRunsQueryParams';
import { NOTIFICATION_VISIBLE_MILLISECS } from '@/utils/constants/common';

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

  const { renameQuery, saveQuery, isQuerySaved, getQuery, updateQuery } = useSavedQueries();
  const { queryName, setQueryName, searchParams } = useTestRunsQueryParams();

  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [editedQueryName, setEditedQueryName] = useState<string>(queryName || '');
  const [isEditingName, setIsEditingName] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus and select the input when editing
  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  useEffect(() => {
    setEditedQueryName(queryName);
  }, [queryName]);

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
      setNotification({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('copyFailedMessage'),
      });
    }
  };

  const handleFinishEditing = () => {
    setIsEditingName(false);
    const newName = editedQueryName.trim();
    const oldName = queryName;

    // Do nothing if the name is empty or unchanged
    if (!newName || newName === oldName) {
      setEditedQueryName(oldName);
      return;
    }

    // Prevent renaming to a name that already exists
    if (isQuerySaved(newName)) {
      setNotification({
        kind: 'error',
        title: translations('renameFailedTitle'),
        subtitle: translations('nameExistsError', { name: newName }),
      });
      setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
      // Revert the input to the original name
      setEditedQueryName(oldName);
      return;
    }

    // Update the main query name in the UI and URL
    setQueryName(newName);

    // Find the original query using the old name
    const queryToRename = getQuery(oldName);
    const currentUrlParams = new URLSearchParams(searchParams).toString();

    // If it was a saved query, perform the rename in storage
    if (queryToRename) {
      // Rename query and update its URL
      // renameQuery(queryToRename.createdAt, newName);
      updateQuery(queryToRename.createdAt, {
        ...queryToRename,
        title: newName,
        url: currentUrlParams,
      });
    }
  };

  // Save new query or update an existing one
  const handleSaveQuery = () => {
    const nameToSave = editedQueryName.trim();

    // Do not save if the name is empty
    if (!nameToSave) return;

    const currentUrlParams = new URLSearchParams(searchParams).toString();
    const existingQuery = getQuery(nameToSave);

    // Case 1: A query with this name already exists. Update its filters.
    if (existingQuery) {
      updateQuery(existingQuery.createdAt, {
        ...existingQuery,
        url: currentUrlParams,
      });

      setNotification({
        kind: 'success',
        title: translations('queryUpdatedTitle'),
        subtitle: translations('queryUpdatedMessage', { name: nameToSave }),
      });
      setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
      return;
    }

    // Case 2: This is a new query. Save it.
    // This also handles the "Save As" scenario where the name was changed from an existing query.
    const baseName = nameToSave.replace(/\s*\(\d+\)$/, '').trim();
    let finalQueryTitle = nameToSave;
    let counter = 1;

    // Loop until it finds a title that is not already saved
    while (isQuerySaved(finalQueryTitle)) {
      finalQueryTitle = `${baseName} (${counter})`;
      counter++;
    }

    const newQuery = {
      title: finalQueryTitle,
      url: currentUrlParams,
      createdAt: new Date().toISOString(),
    };

    saveQuery(newQuery);

    // Update the UI with the final, saved name
    setQueryName(finalQueryTitle);

    setNotification({
      kind: 'success',
      title: translations('querySavedTitle'),
      subtitle: translations('querySavedMessage', { name: finalQueryTitle }),
    });
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
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
        <CollapsibleSideBar />

        <div className={styles.mainContent}>
          <div className={styles.queryNameContainer}>
            <div className={styles.queryNameBlock}>
              {isEditingName ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={editedQueryName}
                  onChange={(e) => setEditedQueryName(e.target.value)}
                  onBlur={handleFinishEditing}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      handleFinishEditing();
                    }
                  }}
                  className={styles.queryNameInput}
                />
              ) : (
                <h3 className={styles.queryNameHeading}>{queryName}</h3>
              )}
              <Button
                kind="ghost"
                hasIconOnly
                renderIcon={Edit}
                iconDescription={translations('editQueryName')}
                onClick={() => {
                  setEditedQueryName(queryName);
                  setIsEditingName(true);
                }}
                size="md"
              />
            </div>

            <Button
              kind="primary"
              type="button"
              onClick={handleSaveQuery}
              data-testid="share-button"
            >
              {translations('saveQuery')}
            </Button>
          </div>
          <Suspense fallback={<p>Loading...</p>}>
            <TestRunsTabs
              requestorNamesPromise={requestorNamesPromise}
              resultsNamesPromise={resultsNamesPromise}
            />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
