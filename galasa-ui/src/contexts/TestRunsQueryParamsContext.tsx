/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  Dispatch,
  SetStateAction,
  useRef,
} from 'react';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

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
import { TimeFrameValues, ColumnDefinition } from '@/utils/interfaces';
import { sortOrderType } from '@/utils/types/common';
import { useDateTimeFormat } from '@/contexts/DateTimeFormatContext';
import { calculateSynchronizedState } from '@/components/test-runs/timeframe/TimeFrameContent';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { valueMap } from '@/utils/urlStateMappers';

interface TestRunsQueryParamsContextType {
  selectedTabIndex: number;
  setSelectedTabIndex: Dispatch<SetStateAction<number>>;
  timeframeValues: TimeFrameValues;
  setTimeframeValues: Dispatch<SetStateAction<TimeFrameValues>>;
  searchCriteria: Record<string, string>;
  setSearchCriteria: Dispatch<SetStateAction<Record<string, string>>>;
  selectedVisibleColumns: string[];
  setSelectedVisibleColumns: Dispatch<SetStateAction<string[]>>;
  sortOrder: { id: string; order: sortOrderType }[];
  setSortOrder: Dispatch<SetStateAction<{ id: string; order: sortOrderType }[]>>;
  columnsOrder: ColumnDefinition[];
  setColumnsOrder: Dispatch<SetStateAction<ColumnDefinition[]>>;
  queryName: string;
  setQueryName: Dispatch<SetStateAction<string>>;
  isInitialized: boolean;
  searchParams: URLSearchParams;
}

const TestRunsQueryParamsContext = createContext<TestRunsQueryParamsContextType | undefined>(
  undefined
);

interface TestRunsQueryParamsProviderProps {
  children: ReactNode;
}

/**
 * Context provider for test runs query parameters.
 * Provides state and functions to manage query parameters for test runs.
 */
export function TestRunsQueryParamsProvider({ children }: TestRunsQueryParamsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const { getResolvedTimeZone } = useDateTimeFormat();
  const { defaultQuery } = useSavedQueries();

  // Track if a URL update is in progress
  const isUrlUpdateInProgress = useRef(true);
  const [isInitialized, setIsInitialized] = useState(false);

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

  // Initial states
  const [selectedTabIndex, setSelectedTabIndex] = useState(TABS_IDS.indexOf('results'));
  const [selectedVisibleColumns, setSelectedVisibleColumns] = useState<string[]>([]);
  const [columnsOrder, setColumnsOrder] = useState<ColumnDefinition[]>([]);
  const [timeframeValues, setTimeframeValues] = useState<TimeFrameValues>({} as TimeFrameValues);
  const [searchCriteria, setSearchCriteria] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<{ id: string; order: sortOrderType }[]>([]);
  const [queryName, setQueryName] = useState('');

  // Effect to synchronize state with URL parameters
  useEffect(() => {
    isUrlUpdateInProgress.current = true;

    // Tab
    const tabParam = searchParams.get('tab');
    const initialIndex = tabParam ? TABS_IDS.indexOf(tabParam) : -1;
    const newTabIndex = initialIndex !== -1 ? initialIndex : TABS_IDS.indexOf('results');
    if (newTabIndex !== selectedTabIndex) {
      setSelectedTabIndex(newTabIndex);
    }

    // Query Name
    const newQueryName = searchParams.get(TEST_RUNS_QUERY_PARAMS.QUERY_NAME) || defaultQuery.title;
    if (newQueryName !== queryName) {
      setQueryName(newQueryName);
    }

    // Visible Columns - apply default visible columns only if visible columns array aren't empty.
    const newVisibleColumns =
      searchParams.get(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS) !== valueMap['']
        ? searchParams.get(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS)?.split(',') ||
          DEFAULT_VISIBLE_COLUMNS
        : [];
    if (newVisibleColumns.join(',') !== selectedVisibleColumns.join(',')) {
      setSelectedVisibleColumns(newVisibleColumns);
    }

    // Columns Order
    const orderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER);
    const newColumnsOrder = orderParam
      ? (orderParam
          .split(',')
          .map((id) => RESULTS_TABLE_COLUMNS.find((col) => col.id === id))
          .filter(Boolean) as ColumnDefinition[])
      : RESULTS_TABLE_COLUMNS;
    if (newColumnsOrder.map((c) => c.id).join(',') !== columnsOrder.map((c) => c.id).join(',')) {
      setColumnsOrder(newColumnsOrder);
    }

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
    const newTimeframeValues = {
      ...calculateSynchronizedState(fromDate, toDate, timezone),
      isRelativeToNow,
    };

    if (
      newTimeframeValues.fromDate?.toISOString() !== timeframeValues.fromDate?.toISOString() ||
      newTimeframeValues.toDate?.toISOString() !== timeframeValues.toDate?.toISOString() ||
      newTimeframeValues.isRelativeToNow !== timeframeValues.isRelativeToNow
    ) {
      setTimeframeValues(newTimeframeValues);
    }

    // Search Criteria
    const newCriteria: Record<string, string> = {};
    SEARCH_CRITERIA_KEYS.forEach((key) => {
      if (searchParams.has(key)) {
        newCriteria[key] = searchParams.get(key) || '';
      }
    });
    if (JSON.stringify(newCriteria) !== JSON.stringify(searchCriteria)) {
      setSearchCriteria(newCriteria);
    }
    // Sort Order
    const sortOrderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.SORT_ORDER);
    const newSortOrder = sortOrderParam
      ? sortOrderParam.split(',').map((item) => {
          const [id, order] = item.split(':');
          return { id, order: order as sortOrderType };
        })
      : [];
    if (JSON.stringify(newSortOrder) !== JSON.stringify(sortOrder)) {
      setSortOrder(newSortOrder);
    }

    // Mark as initialized after the first sync
    if (!isInitialized) {
      setIsInitialized(true);
    }
    isUrlUpdateInProgress.current = false;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, getResolvedTimeZone]);

  // Effect to update the URL when query parameters change
  useEffect(() => {
    if (!isInitialized || isUrlUpdateInProgress.current) return;
    const params = new URLSearchParams();

    // Tab
    params.set(TEST_RUNS_QUERY_PARAMS.TAB, TABS_IDS[selectedTabIndex]);

    // Query Name
    params.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, queryName);

    // Visible Columns
    params.set(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS, selectedVisibleColumns.join(','));

    // Sort Order
    if (sortOrder.length > 0) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.SORT_ORDER,
        sortOrder.map((item) => `${item.id}:${item.order}`).join(',')
      );
    }

    // Columns Order
    params.set(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER, columnsOrder.map((col) => col.id).join(','));

    // Timeframe
    if (timeframeValues.isRelativeToNow) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.DURATION,
        `${timeframeValues.durationDays},${timeframeValues.durationHours},${timeframeValues.durationMinutes}`
      );
    } else if (timeframeValues.fromDate) {
      params.set(TEST_RUNS_QUERY_PARAMS.FROM, timeframeValues.fromDate.toISOString());
      params.set(TEST_RUNS_QUERY_PARAMS.TO, timeframeValues.toDate.toISOString());
    }

    // Search Criteria
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
    isInitialized,
    pathname,
    router,
    selectedTabIndex,
    timeframeValues,
    searchCriteria,
    queryName,
  ]);

  // The value to be passed to the context consumers
  const value = {
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
    searchParams,
    isInitialized,
  };

  return (
    <TestRunsQueryParamsContext.Provider value={value}>
      {children}
    </TestRunsQueryParamsContext.Provider>
  );
}

export function useTestRunsQueryParams() {
  const context = useContext(TestRunsQueryParamsContext);
  if (context === undefined) {
    throw new Error('useTestRunsQueryParams must be used within a TestRunsQueryParamsProvider');
  }
  return context;
}
