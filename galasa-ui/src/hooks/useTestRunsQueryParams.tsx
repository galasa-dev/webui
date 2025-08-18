/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  RESULTS_TABLE_COLUMNS,
  TEST_RUNS_QUERY_PARAMS,
  DAY_MS,
  SEARCH_CRITERIA_KEYS,
  DEFAULT_VISIBLE_COLUMNS,
  MINUTE_MS,
  HOUR_MS,
  TABS_IDS,
  DEFAULT_QUERY,
} from '@/utils/constants/common';
import { decodeStateFromUrlParam, encodeStateToUrlParam } from '@/utils/urlEncoder';
import { TimeFrameValues } from '@/utils/interfaces';
import { ColumnDefinition } from '@/utils/interfaces';
import { sortOrderType } from '@/utils/types/common';
import { useDateTimeFormat } from '@/contexts/DateTimeFormatContext';
import { calculateSynchronizedState } from '@/components/test-runs/timeframe/TimeFrameContent';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';

export default function useTestRunsQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const { getResolvedTimeZone } = useDateTimeFormat();
  const { defaultQuery } = useSavedQueries();

  // Memoize the decoded search params. This will only re-calculate when the raw URL changes.
  const searchParams = useMemo(() => {
    const encodedQueryString = rawSearchParams.get('q');
    if (encodedQueryString) {
      const decodedQueryString = decodeStateFromUrlParam(encodedQueryString);
      if (decodedQueryString) {
        return new URLSearchParams(decodedQueryString);
      }
    }
    // Fallback to rawSearchParams if 'q' is not present or invalid
    return rawSearchParams;
  }, [rawSearchParams]);

  // Initialize State with default values.
  // The state will be synchronized from the URL by the 'reader' effect below.
  const [selectedTabIndex, setSelectedTabIndex] = useState(TABS_IDS.indexOf('results'));
  const [selectedVisibleColumns, setSelectedVisibleColumns] =
    useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [columnsOrder, setColumnsOrder] = useState<ColumnDefinition[]>(RESULTS_TABLE_COLUMNS);
  const [timeframeValues, setTimeframeValues] = useState<TimeFrameValues>(() => {
    const toDate = new Date();
    const fromDate = new Date(toDate.getTime() - DAY_MS);
    const timezone = getResolvedTimeZone();
    return { ...calculateSynchronizedState(fromDate, toDate, timezone), isRelativeToNow: true };
  });
  const [searchCriteria, setSearchCriteria] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<{ id: string; order: sortOrderType }[]>([]);
  const [queryName, setQueryName] = useState<string>(DEFAULT_QUERY.title);

  const [isInitialized, setIsInitialized] = useState(false);

  // It reads the URL and updates the component's internal state.
  useEffect(() => {
    // Tab
    const tabParam = searchParams.get('tab');
    setSelectedTabIndex(tabParam ? TABS_IDS.indexOf(tabParam) : TABS_IDS.indexOf('results'));

    // Query Name
    setQueryName(searchParams.get(TEST_RUNS_QUERY_PARAMS.QUERY_NAME) || defaultQuery.title);

    // Visible Columns
    setSelectedVisibleColumns(
      searchParams.get(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS)?.split(',') ||
        DEFAULT_VISIBLE_COLUMNS
    );

    // Columns Order
    const orderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER);
    if (orderParam) {
      const correctOrder = orderParam
        .split(',')
        .map((id) => RESULTS_TABLE_COLUMNS.find((col) => col.id === id))
        .filter(Boolean) as ColumnDefinition[];
      setColumnsOrder(correctOrder);
    } else {
      setColumnsOrder(RESULTS_TABLE_COLUMNS);
    }

    // Sort Order
    const sortOrderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.SORT_ORDER);
    if (sortOrderParam) {
      const sortOrderArray = sortOrderParam.split(',').map((item) => {
        const [id, order] = item.split(':');
        return { id, order: order as sortOrderType };
      });
      setSortOrder(sortOrderArray);
    } else {
      setSortOrder([]);
    }

    // Search Criteria
    const criteria: Record<string, string> = {};
    SEARCH_CRITERIA_KEYS.forEach((key) => {
      if (searchParams.has(key)) {
        criteria[key] = searchParams.get(key) || '';
      }
    });
    setSearchCriteria(criteria);

    // Timeframe
    const fromParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.FROM);
    const toParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.TO);
    const durationParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.DURATION);

    let toDate: Date,
      fromDate: Date,
      isRelativeToNow = false;
    if (durationParam) {
      const [days, hours, minutes] = durationParam.split(',').map(Number);
      toDate = new Date();
      fromDate = new Date(
        toDate.getTime() - (days * DAY_MS + hours * HOUR_MS + minutes * MINUTE_MS)
      );
      isRelativeToNow = true;
    } else if (fromParam && toParam) {
      toDate = new Date(toParam);
      fromDate = new Date(fromParam);
    } else {
      toDate = new Date();
      fromDate = new Date(toDate.getTime() - DAY_MS);
      isRelativeToNow = true;
    }
    const timezone = getResolvedTimeZone();
    setTimeframeValues({
      ...calculateSynchronizedState(fromDate, toDate, timezone),
      isRelativeToNow,
    });

    // Mark as initialized after the first sync from URL
    setIsInitialized(true);
  }, [searchParams, getResolvedTimeZone]);

  // This effect runs when any piece of state changes, but NOT when the URL itself changes.
  useEffect(() => {
    // Don't update the URL until the state has been initialized from the URL first.
    if (!isInitialized) return;

    const params = new URLSearchParams();

    params.set(TEST_RUNS_QUERY_PARAMS.TAB, TABS_IDS[selectedTabIndex]);
    params.set(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS, selectedVisibleColumns.join(','));
    params.set(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER, columnsOrder.map((col) => col.id).join(','));
    params.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, queryName);

    if (sortOrder.length > 0) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.SORT_ORDER,
        sortOrder.map((item) => `${item.id}:${item.order}`).join(',')
      );
    }

    if (timeframeValues.isRelativeToNow) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.DURATION,
        `${timeframeValues.durationDays},${timeframeValues.durationHours},${timeframeValues.durationMinutes}`
      );
    } else {
      params.set(TEST_RUNS_QUERY_PARAMS.FROM, timeframeValues.fromDate.toISOString());
      params.set(TEST_RUNS_QUERY_PARAMS.TO, timeframeValues.toDate.toISOString());
    }

    Object.entries(searchCriteria).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });

    const encodedQuery = encodeStateToUrlParam(params.toString());
    const newUrl = encodedQuery ? `${pathname}?q=${encodedQuery}` : pathname;

    router.replace(newUrl, { scroll: false });
  }, [
    selectedVisibleColumns,
    columnsOrder,
    sortOrder,
    selectedTabIndex,
    timeframeValues,
    searchCriteria,
    queryName,
    isInitialized,
    pathname,
    router,
  ]);

  return {
    selectedTabIndex,
    setSelectedTabIndex,
    timeframeValues,
    setTimeframeValues,
    searchCriteria,
    setSearchCriteria,
    selectedVisibleColumns,
    setSelectedVisibleColumns,
    sortOrder,
    setSortOrder,
    columnsOrder,
    setColumnsOrder,
    queryName,
    setQueryName,
    isInitialized,
    searchParams,
  };
}
