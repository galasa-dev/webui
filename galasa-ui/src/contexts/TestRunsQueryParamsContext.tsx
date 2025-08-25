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

// Create the provider component
export function TestRunsQueryParamsProvider({ children }: TestRunsQueryParamsProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const rawSearchParams = useSearchParams();
  const { getResolvedTimeZone } = useDateTimeFormat();
  const { defaultQuery } = useSavedQueries();

  const isUrlUpdateInProgress = useRef(true);

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
  const [timeframeValues, setTimeframeValues] = useState<TimeFrameValues>({} as TimeFrameValues); // Will be set by effect
  const [searchCriteria, setSearchCriteria] = useState<Record<string, string>>({});
  const [sortOrder, setSortOrder] = useState<{ id: string; order: sortOrderType }[]>([]);
  const [queryName, setQueryName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    isUrlUpdateInProgress.current = true;

    // Tab
    const tabParam = searchParams.get('tab');
    const initialIndex = tabParam ? TABS_IDS.indexOf(tabParam) : -1;
    setSelectedTabIndex(initialIndex !== -1 ? initialIndex : TABS_IDS.indexOf('results'));

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

    // Search Criteria
    const criteria: Record<string, string> = {};
    SEARCH_CRITERIA_KEYS.forEach((key) => {
      if (searchParams.has(key)) {
        criteria[key] = searchParams.get(key) || '';
      }
    });
    setSearchCriteria(criteria);

    // Sort Order
    const sortOrderParam = searchParams.get(TEST_RUNS_QUERY_PARAMS.SORT_ORDER);
    if (sortOrderParam) {
      const newSortOrder = sortOrderParam.split(',').map((item) => {
        const [id, order] = item.split(':');
        return { id, order: order as sortOrderType };
      });
      setSortOrder(newSortOrder);
    } else {
      setSortOrder([]);
    }

    // Mark as initialized after the first sync
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [searchParams, getResolvedTimeZone, defaultQuery.title, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;

    if (isUrlUpdateInProgress.current) {
      // Unlock the URL for future updates
      isUrlUpdateInProgress.current = false;
      return;
    }

    const params = new URLSearchParams();

    params.set(TEST_RUNS_QUERY_PARAMS.TAB, TABS_IDS[selectedTabIndex]);
    params.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, queryName);

    if (selectedVisibleColumns.length > 0) {
      params.set(TEST_RUNS_QUERY_PARAMS.VISIBLE_COLUMNS, selectedVisibleColumns.join(','));
    }

    if (sortOrder.length > 0) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.SORT_ORDER,
        sortOrder.map((item) => `${item.id}:${item.order}`).join(',')
      );
    }

    params.set(TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER, columnsOrder.map((col) => col.id).join(','));

    if (timeframeValues.isRelativeToNow) {
      params.set(
        TEST_RUNS_QUERY_PARAMS.DURATION,
        `${timeframeValues.durationDays},${timeframeValues.durationHours},${timeframeValues.durationMinutes}`
      );
    } else if (timeframeValues.fromDate) {
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
    isInitialized,
    pathname,
    router,
    selectedTabIndex,
    timeframeValues,
    searchCriteria,
    queryName,
  ]);

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
    isInitialized,
    searchParams,
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
