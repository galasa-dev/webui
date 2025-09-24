/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from '@/styles/test-runs/TestRunsPage.module.css';
import { Button, SkeletonText } from '@carbon/react';
import { Edit } from '@carbon/icons-react';
import { useTestRunsQueryParams } from '@/contexts/TestRunsQueryParamsContext';
import { useTranslations } from 'next-intl';
import { getTranslation } from '@/utils/functions/translations';
import { TRANSLATIONS_KEYS } from '@/utils/constants/common';
import { useMemo } from 'react';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';

interface QueryNameProps {
  inputRef: React.RefObject<HTMLInputElement>;
  isEditingName: boolean;
  editedName: string;
  setEditedName: React.Dispatch<React.SetStateAction<string>>;
  handleFinishEditing: () => void;
  handleStartEditingName: (name: string) => void;
  translations: (key: string) => string;
}

/**
 * QueryName component displays and edits the name of a query.
 * It shows a text input when editing is enabled, and a heading with the query name otherwise.
 */
export default function QueryName({
  inputRef,
  isEditingName,
  editedName,
  setEditedName,
  handleFinishEditing,
  handleStartEditingName,
  translations,
}: QueryNameProps) {
  const FILE_NAME = 'QueryName';
  const { queryName, searchCriteria, setQueryName } = useTestRunsQueryParams();
  const queryNameTranslations = useTranslations(FILE_NAME);
  const { breadCrumbItems } = useHistoryBreadCrumbs();

  // Translate the query name if it matches a key in the translations otherwise use the original query name
  const translatedQueryName = useMemo(() => {
    let translatedQueryName;
    if (!queryName || queryName === TRANSLATIONS_KEYS.DEFAULT_QUERY_NAME) {
      translatedQueryName = getTranslation(
        TRANSLATIONS_KEYS.DEFAULT_QUERY_NAME,
        FILE_NAME,
        queryNameTranslations
      );
    }

    // Handle dynamic translations with parameters
    if (queryName === TRANSLATIONS_KEYS.RECENT_RUNS_OF_TEST) {
      translatedQueryName = getTranslation(queryName, FILE_NAME, queryNameTranslations, {
        name: searchCriteria?.testName ?? '',
      });
    } else if (queryName === TRANSLATIONS_KEYS.ALL_ATTEMPTS_OF_TEST_RUN) {
      // Try to get the test run name from the last breadcrumb item, if not available use the runName from search criteria
      translatedQueryName = getTranslation(queryName, FILE_NAME, queryNameTranslations, {
        name: (breadCrumbItems[breadCrumbItems.length - 1]?.title || searchCriteria?.runName) ?? '',
      });
    }

    // Update the query name to its translated version if it has changed
    if (translatedQueryName !== queryName) {
      setQueryName(translatedQueryName || queryName);
    }

    return translatedQueryName || queryName;
  }, [
    queryName,
    searchCriteria,
    translations,
    queryNameTranslations,
    setQueryName,
    breadCrumbItems,
  ]);

  return (
    <div className={styles.queryNameBlock}>
      <div className={styles.queryNameBlock}>
        {!queryName ? (
          <SkeletonText heading />
        ) : (
          <>
            {isEditingName ? (
              <input
                ref={inputRef}
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleFinishEditing}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleFinishEditing();
                  }
                }}
                className={styles.queryNameInput}
              />
            ) : (
              <h3 className={styles.queryNameHeading}>{translatedQueryName}</h3>
            )}
            <Button
              kind="ghost"
              hasIconOnly
              renderIcon={Edit}
              iconDescription={translations('editQueryName')}
              onClick={handleStartEditingName.bind(null, translatedQueryName)}
              size="md"
            />
          </>
        )}
      </div>
    </div>
  );
}
