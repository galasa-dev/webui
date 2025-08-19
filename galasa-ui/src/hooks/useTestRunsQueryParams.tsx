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
} from '@/utils/constants/common';
import { decodeStateFromUrlParam, encodeStateToUrlParam } from '@/utils/urlEncoder';
import { TimeFrameValues } from '@/utils/interfaces';
import { ColumnDefinition, runStructure } from '@/utils/interfaces';
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

  // Decode the search params from the URL every time the searchParams change
  const searchParams = useMemo(() => {
    const encodedQueryString = rawSearchParams.get('q');
    if (encodedQueryString) {
      const decodedQueryString = decodeStateFromUrlParam(encodedQueryString);
      if (decodedQueryString) {
        return new URLSearchParams(decodedQueryString);
      }
    }
    return rawSearchParams;
  }, [rawSearchParams]);

  // Initialize selectedTabIndex based on URL parameters or default to first tab
  const [selectedTabIndex, setSelectedTabIndex] = useState(() => {
    const tabParam = searchParams.get('tab');
    const initialIndex = tabParam ? TABS_IDS.indexOf(tabParam) : -1;
    return initialIndex !== -1 ? initialIndex : TABS_IDS.indexOf('results');
  });

  // Initialize selectedVisibleColumns  based on URL parameters or default values
  const [selectedVisibleColumns, setSelectedVisibleColumns] = useState<string[]>(
    () =>
      searchParams.get(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS)?.split(',') ||
      DEFAULT_VISIBLE_COLUMNS
  );

  // Initialize columnsOrder based on URL parameters or default to RESULTS_TABLE_COLUMNS
  const [columnsOrder, setColumnsOrder] = useState<ColumnDefinition[]>(() => {
    const orderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER);
    let correctOrder: ColumnDefinition[] = RESULTS_TABLE_COLUMNS;

    // Parse the order from the URL parameter
    if (orderParam) {
      correctOrder = orderParam
        .split(',')
        .map((id) => RESULTS_TABLE_COLUMNS.find((col) => col.id === id))
        .filter(Boolean) as ColumnDefinition[];
    }

    return correctOrder;
  });

  // Initialize timeframe values based on URL parameters or default to last 24 hours
  const [timeframeValues, setTimeframeValues] = useState<TimeFrameValues>(() => {
    const fromParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.FROM);
    const toParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.TO);
    const durationParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.DURATION);

    let toDate: Date,
      fromDate: Date,
      isRelativeToNow = false;
    if (durationParam) {
      // If duration is specified, calculate fromDate and toDate based on it
      const [days, hours, minutes] = durationParam.split(',').map(Number);
      toDate = new Date();
      fromDate = new Date(
        toDate.getTime() - (days * DAY_MS + hours * HOUR_MS + minutes * MINUTE_MS)
      );
      isRelativeToNow = true;
    } else if (fromParam && toParam) {
      // If no duration is specified, use the provided from/to dates
      toDate = new Date(toParam);
      fromDate = new Date(fromParam);
    } else {
      // If no from/to dates are specified, default to last 1 day (duration-based) from now
      toDate = new Date();
      fromDate = new Date(toDate.getTime() - DAY_MS);
      isRelativeToNow = true;
    }

    const timezone = getResolvedTimeZone();
    return { ...calculateSynchronizedState(fromDate, toDate, timezone), isRelativeToNow };
  });

  // Initialize search criteria based on URL parameters
  const [searchCriteria, setSearchCriteria] = useState<Record<string, string>>(() => {
    const criteria: Record<string, string> = {};
    SEARCH_CRITERIA_KEYS.forEach((key) => {
      if (searchParams.has(key)) {
        criteria[key] = searchParams.get(key) || '';
      }
    });
    return criteria;
  });

  // Initialize sortOrder based on URL parameters or default to an empty array
  // URL should look like this sortOrder?result:asc,status:desc
  const [sortOrder, setSortOrder] = useState<{ id: string; order: sortOrderType }[]>(() => {
    const sortOrderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.SORT_ORDER);
    let sortOrderArray: { id: string; order: sortOrderType }[] = [];
    if (sortOrderParam) {
      sortOrderArray = sortOrderParam.split(',').map((item) => {
        const [id, order] = item.split(':');
        return { id, order: order as sortOrderType };
      });
    }
    return sortOrderArray;
  });

  const [queryName, setQueryName] = useState(() => {
    return searchParams.get(TEST_RUNS_QUERY_PARAMS.QUERY_NAME) || defaultQuery.title;
  });

  // State to track if the component has been initialized
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // Save and encode current state to the URL. This is the single source of truth for URL updates.
  useEffect(() => {
    if (!isInitialized) return;

    // Build the query string from the current state
    const params = new URLSearchParams();

    // Tab
    params.set(TEST_RUNS_QUERY_PARAMS.TAB, TABS_IDS[selectedTabIndex]);

    // Query Name
    params.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, queryName);

    // Table Design
    if (selectedVisibleColumns.length > 0) {
      params.set(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS, selectedVisibleColumns.join(','));
    } else {
      // If no columns are selected, we can clear the parameter
      params.delete(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS);
    }
    if (sortOrder.length > 0) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.SORT_ORDER,
        sortOrder.map((item) => `${item.id}:${item.order}`).join(',')
      );
    } else {
      params.delete(TEST_RUNS_QUERY_PARAMS.SORT_ORDER);
    }

    params.set(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER, columnsOrder.map((col) => col.id).join(','));

    // Timeframe
    if (timeframeValues.isRelativeToNow) {
      // If relative to now, we can use the "duration" parameter
      params.set(
        TEST_RUNS_QUERY_PARAMS.DURATION,
        `${timeframeValues.durationDays},${timeframeValues.durationHours},${timeframeValues.durationMinutes}`
      );
    } else {
      // If not relative to now, we can use the "from" and "to" parameters
      params.set(TEST_RUNS_QUERY_PARAMS.FROM, timeframeValues.fromDate.toISOString());
      params.set(TEST_RUNS_QUERY_PARAMS.TO, timeframeValues.toDate.toISOString());
    }

    // Search Criteria
    Object.entries(searchCriteria).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        // Remove empty criteria
        params.delete(key);
      }
    });

    // Encode the URL parameters to shorten the URL
    const encodedQuery = encodeStateToUrlParam(params.toString());
    if (encodedQuery) {
      router.replace(`${pathname}?q=${encodedQuery}`, { scroll: false });
    } else {
      // If there are no params, clear the URL.
      router.replace(pathname, { scroll: false });
    }
  }, [
    selectedVisibleColumns,
    columnsOrder,
    sortOrder,
    isInitialized,
    pathname,
    router,
    selectedTabIndex,
    searchParams,
    timeframeValues,
    searchCriteria,
    queryName,
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
