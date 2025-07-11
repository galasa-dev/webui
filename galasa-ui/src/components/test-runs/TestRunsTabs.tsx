/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react'; 
import styles from '@/styles/TestRunsPage.module.css';
import TimeframeContent from './TimeFrameContent';
import TestRunsTable from './TestRunsTable';
import SearchCriteriaContent from "./SearchCriteriaContent";
import TableDesignContent from './TableDesignContent';
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { TestRunsData } from "@/utils/testRuns";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from 'react';
import { RESULTS_TABLE_COLUMNS, COLUMNS_IDS, RUN_QUERY_PARAMS} from '@/utils/constants/common';
import { useQuery } from '@tanstack/react-query';
import { ColumnDefinition, runStructure, sortOrderType } from '@/utils/interfaces';
import { Run, TestStructure } from '@/generated/galasaapi';


interface TabConfig {
  id: string;
  label: string;
}

interface TestRunsTabProps {
  requestorNamesPromise: Promise<string[]>;
  resultsNamesPromise: Promise<string[]>;
}


export default function TestRunsTabs({ requestorNamesPromise, resultsNamesPromise}: TestRunsTabProps) {
  const translations = useTranslations("TestRunsTabs");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const TABS_IDS = ['timeframe', 'table-design', 'search-criteria', 'results'];

  // Initialize selectedIndex based on URL parameters or default to first tab
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const tabParam = searchParams.get("tab");
    const initialIndex = tabParam ? TABS_IDS.indexOf(tabParam) : -1;
    return initialIndex !== -1 ? initialIndex : 0;
  });

  // Initialize selectedVisibleColumns  based on URL parameters or default values
  const [selectedVisibleColumns, setSelectedVisibleColumns] = useState<string[]>(
    () => searchParams.get(RUN_QUERY_PARAMS.VISIBLE_COLUMNS)?.split(',') || [
      COLUMNS_IDS.SUBMITTED_AT,
      COLUMNS_IDS.TEST_RUN_NAME,
      COLUMNS_IDS.REQUESTOR,
      COLUMNS_IDS.TEST_NAME,
      COLUMNS_IDS.STATUS,
      COLUMNS_IDS.RESULT,
    ]
  );

  // Initialize columnsOrder based on URL parameters or default to RESULTS_TABLE_COLUMNS
  const [columnsOrder, setColumnsOrder] = useState<ColumnDefinition[]>(() => {
    const orderParam = searchParams.get(RUN_QUERY_PARAMS.COLUMNS_ORDER);
    let correctOrder: ColumnDefinition[] = RESULTS_TABLE_COLUMNS;

    // Parse the order from the URL parameter
    if (orderParam) {
      correctOrder = orderParam.split(',')
        .map(id => RESULTS_TABLE_COLUMNS.find(col => col.id === id))
        .filter(Boolean) as ColumnDefinition[];
    }

    return correctOrder;
  });

  // Initialize sortOrder based on URL parameters or default to an empty array
  // URL should look like this sortOrder?result:asc,status:desc
  const [sortOrder, setSortOrder] = useState<{id: string; order: sortOrderType}[]>(() => {
    const sortOrderParam = searchParams.get(RUN_QUERY_PARAMS.SORT_ORDER);
    let sortOrderArray: {id: string; order: sortOrderType}[] = [];
    if (sortOrderParam) {
      sortOrderArray = sortOrderParam.split(',').map((item) => {
        const [id, order] = item.split(':');
        return { id, order: order as sortOrderType };
      });
    }
    return sortOrderArray;
  })
    
  // State to track if the component has been initialized
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {setIsInitialized(true);}, []);

  // Define the tabs with their corresponding labels
  const TABS_CONFIG: TabConfig[] = [
    { id: TABS_IDS[0], label: translations('tabs.timeframe') },
    { id: TABS_IDS[1], label: translations('tabs.tableDesign') },
    { id: TABS_IDS[2], label: translations('tabs.searchCriteria') },
    { id: TABS_IDS[3], label: translations('tabs.results') },
  ];

  // Save to URL parameters (only after initialization)
  useEffect(() => {
    if (!isInitialized) return;

    const currentTab = TABS_CONFIG[selectedIndex];
    const visibleColumnsParam = selectedVisibleColumns.join(",");
    const columnsOrderParam = columnsOrder.map(col => col.id).join(",");
    const sortOrderParam = sortOrder.map(item => `${item.id}:${item.order}`).join(",");

    const params = new URLSearchParams(searchParams.toString());

    // Set current tab, visible columns, columns order, and sort order
    params.set(RUN_QUERY_PARAMS.TAB, currentTab.id);

    if(selectedVisibleColumns.length > 0) {
      params.set(RUN_QUERY_PARAMS.VISIBLE_COLUMNS, visibleColumnsParam);
    } else {
      // If no columns are selected, we can clear the parameter
      params.delete(RUN_QUERY_PARAMS.VISIBLE_COLUMNS);
    }

    if (sortOrder.length > 0) {
      params.set(RUN_QUERY_PARAMS.SORT_ORDER, sortOrderParam);
    } else {
      // If no sort order is set, we can clear the parameter
      params.delete(RUN_QUERY_PARAMS.SORT_ORDER);
    }

    params.set(RUN_QUERY_PARAMS.COLUMNS_ORDER, columnsOrderParam);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedVisibleColumns, columnsOrder, isInitialized, pathname, router, selectedIndex, sortOrder]);

  /**
   * Transforms and flattens the raw API data for Carbon DataTable.
   * @param runs - The array of run objects from the API.
   * @returns A new array of flat objects, each with a unique `id` and properties matching the headers.
   */
  const transformRunsforTable = (runs: Run[]) : runStructure[] => {
    if (!runs) {
      return [];
    }
  
    return runs.map((run) => {
      const structure = run.testStructure || {};
  
      return {
        id: run.runId,
        submittedAt: structure.queued ? new Date(structure.queued).toLocaleString().replace(',', '') : 'N/A',
        runName: structure.runName || 'N/A',
        requestor: structure.requestor || 'N/A',
        group: structure.group || 'N/A',
        bundle: structure.bundle || 'N/A',
        package: structure.testName?.substring(0, structure.testName.lastIndexOf('.')) || 'N/A',
        testName: structure.testShortName || structure.testName || 'N/A',
        tags: structure.tags ? structure.tags.join(', ') : 'N/A',
        status: structure.status || 'N/A',
        result: structure.result || 'N/A',
        submissionId: structure.submissionId || 'N/A',
      };
    });
  };

  const handleTabChange = (event: {selectedIndex : number}) => {
    const currentIndex = event.selectedIndex;
    setSelectedIndex(currentIndex);
  };


  // Create a canonical query key based on the search parameters so that it won't refetch unnecessarily
  const queryKey = useMemo(() => {
    // Parameters that actually affect the data fetch
    const relevantParameters = [
      RUN_QUERY_PARAMS.FROM, RUN_QUERY_PARAMS.TO, RUN_QUERY_PARAMS.RUN_NAME, RUN_QUERY_PARAMS.REQUESTOR, RUN_QUERY_PARAMS.GROUP,
      RUN_QUERY_PARAMS.SUBMISSION_ID, RUN_QUERY_PARAMS.BUNDLE, RUN_QUERY_PARAMS.TEST_NAME, RUN_QUERY_PARAMS.RESULT, RUN_QUERY_PARAMS.STATUS, RUN_QUERY_PARAMS.TAGS
    ];

    // Create a new URLSearchParams object with the data that actually affects data fetch
    const canonicalParams: Record<string, string> = {};
    for (const key of relevantParameters) {
      if (searchParams.has(key)) {
        let value = searchParams.get(key) || '';

        // Normalize order-independent parameters
        if (key === RUN_QUERY_PARAMS.TAGS ||
            key === RUN_QUERY_PARAMS.RESULT || 
            key === RUN_QUERY_PARAMS.STATUS || 
            key === RUN_QUERY_PARAMS.REQUESTOR) {
          value = value?.split(',').sort().join(',');
        }

        canonicalParams[key] = value;
      }
    }
    
    return ['testRuns', canonicalParams];
  }, [searchParams]);

  const {data: runsData, isLoading, isError } = useQuery<TestRunsData>({
    // Cache data based on search parameters
    queryKey: queryKey,
    queryFn: async () => {
      const response = await fetch(`/internal-api/test-runs?${searchParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch test runs');
      }
      
      return response.json() as Promise<TestRunsData>;
    },
    // Only run the query when the results tab is selected
    enabled: selectedIndex === TABS_IDS.indexOf('results'), 
    // Only refetch when the canonical query key changes
    staleTime: Infinity,
  });



  // Memoized sorting logic for multi-level sorting based on column order
  const sortedRuns = useMemo(() => {
    const runsToSort = runsData?.runs ? transformRunsforTable(runsData.runs) : [];

    if (sortOrder.length !== 0 && runsToSort.length !== 0) {
      return runsToSort.sort((runA, runB) => {
        // Sort based on the order of columns in columnsOrder (Assumption: Leftmost has higher priority)
        for (const {id} of columnsOrder) {
          const sortConfig = sortOrder.find(order => order.id === id);

          // Skip this column if its sort is 'none' or not set.
          if (!sortConfig) {
            continue;
          }

          const valueA = runA[id] ?? '';
          const valueB = runB[id] ?? '';
          console.log(`Sorting by ${id}: ${valueA} vs ${valueB}`);

          // Handle tags array specifically if needed
          const valA = Array.isArray(valueA) ? valueA.join(',') : valueA;
          const valB = Array.isArray(valueB) ? valueB.join(',') : valueB;

          if (valA < valB) {
            return sortConfig.order === 'asc' ? -1 : 1;
          } else if (valueA > valueB) {
            return sortConfig.order === 'asc' ? 1 : -1;
          }
        }
        // If all compared columns are equal, maintain original order
        return 0;
      })
    }
    return runsToSort;
  }, [runsData, sortOrder, columnsOrder])


  return (
    <Tabs 
      className={styles.tabs}
      selectedIndex={selectedIndex}
      onChange={handleTabChange}
    >
      <TabList scrollDebounceWait={200} aria-label="Test Runs Tabs">
        {TABS_CONFIG.map((tab) => (
          <Tab key={tab.label}>{tab.label}</Tab>
        ))}
      </TabList>
      <TabPanels>
        <TabPanel>
          <div className={styles.tabContent}><TimeframeContent /></div>
        </TabPanel>
        <TabPanel>
          <div className={styles.tabContent}>
            <TableDesignContent
              selectedRowIds={selectedVisibleColumns}
              setSelectedRowIds={setSelectedVisibleColumns}
              tableRows={columnsOrder}
              setTableRows={setColumnsOrder}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <div className={styles.tabContent}>
            <SearchCriteriaContent
              requestorNamesPromise={requestorNamesPromise}
              resultsNamesPromise={resultsNamesPromise}
            />
          </div>
        </TabPanel>
        <TabPanel>
          <div className={styles.tabContent}>
            <TestRunsTable
              runsList={sortedRuns ?? []}
              limitExceeded={runsData?.limitExceeded ?? false}
              visibleColumns={selectedVisibleColumns}
              orderedHeaders={columnsOrder}
              isLoading={isLoading}
              isError={isError}
            />
          </div>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}
