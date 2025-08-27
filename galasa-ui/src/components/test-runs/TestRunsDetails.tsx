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
import { Button, SkeletonText, InlineNotification } from '@carbon/react';
import { Edit, Share } from '@carbon/icons-react';
import PageTile from '../PageTile';
import CollapsibleSideBar from './saved-queries/CollapsibleSideBar';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useTestRunsQueryParams } from '@/contexts/TestRunsQueryParamsContext';
import { NOTIFICATION_VISIBLE_MILLISECS, TEST_RUNS_QUERY_PARAMS } from '@/utils/constants/common';
import { encodeStateToUrlParam } from '@/utils/urlEncoder';
import QueryName from './QueryName';

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

  const { saveQuery, isQuerySaved, getQuery, updateQuery } = useSavedQueries();
  const { queryName, setQueryName, searchParams } = useTestRunsQueryParams();

  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);

  const activeQuery = getQuery(queryName);

  // Focus and select the input when editing
  useEffect(() => {
    if (isEditingName) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditingName]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setNotification({
        kind: 'success',
        title: translations('copiedTitle'),
        subtitle: translations('copiedMessage'),
      });
      setTimeout(() => setNotification(null), 6000);
    } catch (err) {
      setNotification({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('copyFailedMessage'),
      });
    }
  };

  const handleStartEditingName = (queryName: string) => {
    setEditedName(queryName);
    setIsEditingName(true);
  };

  const handleFinishEditing = () => {
    setIsEditingName(false);
    const newName = editedName.trim();
    const oldName = queryName;

    console.log('new Name: ', newName);
    console.log('old name: ', oldName);

    // Do nothing if the name is empty or unchanged.
    if (!newName || newName === oldName) {
      return;
    }

    // Prevent renaming to a name that already exists
    if (isQuerySaved(newName)) {
      setNotification({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('nameExistsError', { name: newName }),
      });
      setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
      return;
    }

    // Find the original query using the old name
    const queryToRename = getQuery(oldName);

    // If it was a saved query, perform the rename in storage
    if (queryToRename) {
      const updatedUrlParams = new URLSearchParams(searchParams);
      updatedUrlParams.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, newName);

      console.log('Updated URL Parmas for : ', queryToRename.createdAt, ' ', updatedUrlParams);
      updateQuery(queryToRename.createdAt, {
        ...queryToRename,
        title: newName,
        url: encodeStateToUrlParam(updatedUrlParams.toString()),
      });
    }

    // Update the local state to reflect the new name and save it to the URL
    setQueryName(newName);
  };

  // Save new query or update an existing one
  const handleSaveQuery = () => {
    const nameToSave = queryName.trim();

    if (!nameToSave) return;

    const currentUrlParams = new URLSearchParams(searchParams).toString();
    const existingQuery = getQuery(nameToSave);

    // If the query already exists, update it
    if (existingQuery) {
      updateQuery(existingQuery.createdAt, {
        ...existingQuery,
        url: encodeStateToUrlParam(currentUrlParams.toString()),
      });

      setNotification({
        kind: 'success',
        title: translations('successTitle'),
        subtitle: translations('queryUpdatedMessage', { name: nameToSave }),
      });
      setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
      return;
    }

    // If the query doesn't exist, create a new one with a unique name
    const baseName = nameToSave.replace(/\s*\(\d+\)$/, '').trim();
    let finalQueryTitle = nameToSave;
    let counter = 1;

    while (isQuerySaved(finalQueryTitle)) {
      finalQueryTitle = `${baseName} (${counter})`;
      counter++;
    }

    const newQuery = {
      title: finalQueryTitle,
      url: encodeStateToUrlParam(currentUrlParams.toString()),
      createdAt: new Date().toISOString(),
    };

    // Save the new query to the localStorage
    saveQuery(newQuery);

    setNotification({
      kind: 'success',
      title: translations('success'),
      subtitle: translations('querySavedMessage', { name: finalQueryTitle }),
    });
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
  };

  const isSaveQueryDisabled = activeQuery?.url === encodeStateToUrlParam(searchParams.toString());

  console.log('Active query URL: ', activeQuery?.url);
  console.log('Current url: ', encodeStateToUrlParam(searchParams.toString()));

  return (
    <div className={styles.testRunsPage}>
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
        <CollapsibleSideBar handleEditQueryName={handleStartEditingName} />

        <div className={styles.mainContent}>
          <div className={styles.queryNameContainer}>
            <QueryName
              inputRef={inputRef}
              isEditingName={isEditingName}
              editedName={editedName}
              setEditedName={setEditedName}
              handleFinishEditing={handleFinishEditing}
              handleStartEditingName={handleStartEditingName}
              translations={translations}
            />

            <Button
              kind="primary"
              type="button"
              onClick={handleSaveQuery}
              data-testid="save-query-button"
              disabled={isSaveQueryDisabled}
            >
              {translations('saveQuery')}
            </Button>
          </div>
          <div className={styles.tabsContainer}>
            <Suspense fallback={<p>Loading...</p>}>
              <TestRunsTabs
                requestorNamesPromise={requestorNamesPromise}
                resultsNamesPromise={resultsNamesPromise}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
