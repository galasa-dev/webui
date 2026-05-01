/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import BreadCrumb from '@/components/common/BreadCrumb';
import TestRunsTabs from '@/components/test-runs/TestRunsTabs';
import styles from '@/styles/test-runs/TestRunsPage.module.css';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { useTranslations } from 'next-intl';
import { NotificationType, SavedQueryType } from '@/utils/types/common';
import { Button, InlineNotification } from '@carbon/react';
import { Share } from '@carbon/icons-react';
import PageTile from '../PageTile';
import CollapsibleSideBar from './saved-queries/CollapsibleSideBar';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useTestRunsQueryParams } from '@/contexts/TestRunsQueryParamsContext';
import {
  NOTIFICATION_VISIBLE_MILLISECS,
  TABS_IDS,
  TEST_RUNS_QUERY_PARAMS,
} from '@/utils/constants/common';
import { decodeStateFromUrlParam, encodeStateToUrlParam } from '@/utils/encoding/urlEncoder';
import QueryName from './QueryName';
import { generateUniqueQueryName } from '@/utils/functions/savedQueries';
import TestRunsSearch from './TestRunsSearch';

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

  const { saveQuery, isQuerySaved, getQueryByName, updateQuery } = useSavedQueries();
  const { queryName, searchParams, updateQueryInUrl } = useTestRunsQueryParams();

  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [editedName, setEditedName] = useState<string>(queryName || '');

  const inputRef = useRef<HTMLInputElement>(null);

  const activeQuery = getQueryByName(queryName);

  const hasUnsavedNameChange = useMemo(() => {
    let hasUnsavedChanges = false;
    if (isEditingName) {
      const trimmedName = editedName.trim();
      hasUnsavedChanges = trimmedName !== '' && trimmedName !== queryName;
    }
    return hasUnsavedChanges;
  }, [isEditingName, editedName, queryName]);

  // Sync editedName with queryName when queryName changes
  useEffect(() => {
    if (queryName && !isEditingName) {
      setEditedName(queryName);
    }
  }, [queryName, isEditingName]);

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
      showNotification('success', translations('copiedTitle'), translations('copiedMessage'));
    } catch (err) {
      if (window.location.protocol === 'http:') {
        showNotification(
          'warning',
          translations('warningTitle'),
          translations('copyWarningMessage')
        );
      } else {
        console.error('Failed to copy:', err);
        showNotification('error', translations('errorTitle'), translations('copyFailedMessage'));
      }
    }
  };

  const handleStartEditingName = (queryName: string) => {
    setEditedName(queryName);
    setIsEditingName(true);
  };

  const handleFinishEditing = () => {
    setIsEditingName(false);
  };

  const showNotification = (kind: NotificationType['kind'], title: string, subtitle: string) => {
    setNotification({ kind, title, subtitle });
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
  };

  const validateQueryName = (newName: string): boolean => {
    if (isEditingName && newName !== queryName && isQuerySaved(newName)) {
      showNotification(
        'error',
        translations('errorTitle'),
        translations('nameExistsError', { name: newName })
      );
      return false;
    }
    return true;
  };

  const prepareQueryUrlParams = (nameToSave: string): URLSearchParams => {
    const params = new URLSearchParams(searchParams);
    params.set(TEST_RUNS_QUERY_PARAMS.TAB, TABS_IDS[3]);
    params.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, nameToSave);
    return params;
  };

  const handleRenameQuery = (
    queryToUpdate: SavedQueryType,
    nameToSave: string,
    urlParams: URLSearchParams
  ) => {
    updateQueryInUrl(urlParams);
    updateQuery(queryToUpdate.createdAt, {
      ...queryToUpdate,
      title: nameToSave,
      url: encodeStateToUrlParam(urlParams.toString()),
    });
    showNotification('success', translations('successTitle'), translations('queryUpdatedMessage'));
  };

  const handleUpdateExistingQuery = (existingQuery: SavedQueryType, urlParams: URLSearchParams) => {
    updateQuery(existingQuery.createdAt, {
      ...existingQuery,
      url: encodeStateToUrlParam(urlParams.toString()),
    });
    showNotification('success', translations('successTitle'), translations('queryUpdatedMessage'));
  };

  const handleCreateNewQuery = (nameToSave: string, urlParams: URLSearchParams) => {
    const finalQueryTitle = generateUniqueQueryName(nameToSave, isQuerySaved);
    const newQuery = {
      title: finalQueryTitle,
      url: encodeStateToUrlParam(urlParams.toString()),
      createdAt: new Date().toISOString(),
    };
    saveQuery(newQuery);
    showNotification(
      'success',
      translations('successTitle'),
      translations('newQuerySavedMessage', { name: finalQueryTitle })
    );
  };

  // Save new query or update an existing one
  const handleSaveQuery = () => {
    try {
      const nameToSave = (isEditingName ? editedName : queryName || '').trim();

      if (!nameToSave) return;

      if (!validateQueryName(nameToSave)) return;

      const urlParams = prepareQueryUrlParams(nameToSave);
      const queryToUpdate = getQueryByName(queryName);

      if (queryToUpdate && queryToUpdate.title !== nameToSave) {
        handleRenameQuery(queryToUpdate, nameToSave, urlParams);
        return;
      }

      const existingQuery = getQueryByName(nameToSave);
      if (existingQuery) {
        handleUpdateExistingQuery(existingQuery, urlParams);
        return;
      }

      handleCreateNewQuery(nameToSave, urlParams);
    } finally {
      if (isEditingName) {
        setIsEditingName(false);
      }
    }
  };

  const isSaveQueryDisabled = useMemo(() => {
    // Enable button if there's an unsaved name change
    if (hasUnsavedNameChange) {
      return false;
    }

    // If query doesn't exist in storage → keep enabled (it's a new query)
    if (!activeQuery) {
      return isQuerySaved(queryName.trim()) || false;
    }

    const currentUrlParams = new URLSearchParams(searchParams);

    // If the queryName in URL and activeQuery.title don't match → still loading → keep disabled
    if (currentUrlParams.get(TEST_RUNS_QUERY_PARAMS.QUERY_NAME) !== activeQuery?.title) {
      return true;
    }

    // Delete "tab" param from the current URL
    currentUrlParams.delete(TEST_RUNS_QUERY_PARAMS.TAB);

    let queryURL = activeQuery?.url ? decodeStateFromUrlParam(activeQuery.url) : '';

    if (queryURL) {
      const queryUrlParams = new URLSearchParams(queryURL);

      // Delete "tab" param from the query URL
      queryUrlParams.delete(TEST_RUNS_QUERY_PARAMS.TAB);
      queryURL = queryUrlParams.toString();
    }

    let isDisabled = false;
    // Disable if the current URL params (excluding tab) match the active query's URL
    if (
      currentUrlParams.toString() === queryURL ||
      queryURL === '' ||
      currentUrlParams.toString() === ''
    ) {
      isDisabled = true;
    }

    return isDisabled;
  }, [activeQuery, searchParams, isQuerySaved, queryName, hasUnsavedNameChange]);

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
          <TestRunsSearch />
          <div className={styles.queryNameContainer}>
            <QueryName
              inputRef={inputRef}
              isEditingName={isEditingName}
              editedName={editedName}
              setEditedName={setEditedName}
              handleFinishEditing={handleFinishEditing}
              handleStartEditingName={handleStartEditingName}
              handleSaveQuery={handleSaveQuery}
              translations={translations}
            />

            <Button
              kind="primary"
              type="button"
              onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                // Prevent the input's blur event from firing when clicking this button
                // This keeps isEditingName true so the button stays enabled and onClick fires
                e.preventDefault();
              }}
              onClick={handleSaveQuery}
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
