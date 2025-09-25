/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useTestRunsQueryParams } from '@/contexts/TestRunsQueryParamsContext';
import { QUERY_NAME_TRANSLATION_NAMESPACE, TRANSLATIONS_KEYS } from '@/utils/constants/common';
import { getTranslation } from '@/utils/functions/translations';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

/**
 * Custom hook to translate query names based on the current context and translations.
 *
 * @param displayedQueryName - Optional query name to be translated. If not provided, the query name from context will be used.
 * @returns An object containing the translated query name.
 */
export default function useTranslateQueryName(displayedQueryName?: string) {
  const queryNameTranslations = useTranslations(QUERY_NAME_TRANSLATION_NAMESPACE);
  const { queryName, searchCriteria, previousTestRunName, setQueryName } = useTestRunsQueryParams();

  const effectiveQueryName = displayedQueryName || queryName;

  // Translate the query name if it matches a key in the translations otherwise use the original query name
  const translatedQueryName = useMemo(() => {
    let translatedQueryName;
    if (!effectiveQueryName || effectiveQueryName === TRANSLATIONS_KEYS.DEFAULT_QUERY_NAME) {
      translatedQueryName = getTranslation(
        TRANSLATIONS_KEYS.DEFAULT_QUERY_NAME,
        QUERY_NAME_TRANSLATION_NAMESPACE,
        queryNameTranslations
      );
    }

    // Handle dynamic translations with parameters
    if (effectiveQueryName === TRANSLATIONS_KEYS.RECENT_RUNS_OF_TEST) {
      translatedQueryName = getTranslation(
        effectiveQueryName,
        QUERY_NAME_TRANSLATION_NAMESPACE,
        queryNameTranslations,
        {
          name: searchCriteria?.testName ?? '',
        }
      );
    } else if (effectiveQueryName === TRANSLATIONS_KEYS.ALL_ATTEMPTS_OF_TEST_RUN) {
      // Get the previous test run name from the context if available, otherwise fallback to search criteria
      translatedQueryName = getTranslation(
        effectiveQueryName,
        QUERY_NAME_TRANSLATION_NAMESPACE,
        queryNameTranslations,
        {
          name: previousTestRunName || searchCriteria?.runName || '',
        }
      );
    }

    // Update the query name to its translated version if it has changed
    if (translatedQueryName !== queryName) {
      setQueryName(translatedQueryName || queryName);
    }

    return translatedQueryName || queryName;
  }, [
    queryName,
    searchCriteria,
    queryNameTranslations,
    previousTestRunName,
    effectiveQueryName,
    setQueryName,
  ]);

  return { translatedQueryName };
}
