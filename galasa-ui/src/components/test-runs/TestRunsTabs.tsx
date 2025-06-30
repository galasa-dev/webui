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
import { TestRunsData } from "@/utils/testRuns";
import { useTranslations } from "next-intl";
import { useState } from 'react';
import { RESULTS_TABLE_COLUMNS } from '@/utils/constants/common';

interface TabConfig {
  label: string;
  component: React.ReactNode;
}

interface TestRunsTabProps {
  runsListPromise: Promise<TestRunsData>;
  requestorNamesPromise: Promise<string[]>;
  resultsNamesPromise: Promise<string[]>;
}


export default function TestRunsTabs({runsListPromise, requestorNamesPromise, resultsNamesPromise}: TestRunsTabProps) {
  const translations = useTranslations("TestRunsTabs");
  const [selectedVisibleColumns, setSelectedVisibleColumns] = useState<string[]>(["submittedAt", "testRunName", "requestor", "testName", "status", "result"]);
  const [columnsOrder, setColumnsOrder] = useState<{ id: string; columnName: string }[]>(RESULTS_TABLE_COLUMNS);

  // Define the tabs with their corresponding content.
  const TABS_CONFIG: TabConfig[] = [
    {
      label: translations("tabs.timeframe"),
      component: <TimeframeContent />,
    },
    {
      label: translations("tabs.tableDesign"),
      component: <TableDesignContent 
      selectedRowIds={selectedVisibleColumns}
      setSelectedRowIds={setSelectedVisibleColumns}
      tableRows={columnsOrder}
      setTableRows={setColumnsOrder}
      />,
    },
    {
      label: translations("tabs.searchCriteria"),
      component: <SearchCriteriaContent requestorNamesPromise={requestorNamesPromise} resultsNamesPromise={resultsNamesPromise}/>,
    },
    {
      label: translations("tabs.results"),
      component: <TestRunsTable 
      runsListPromise={runsListPromise}
      visibleColumns={selectedVisibleColumns}
      orderedHeaders={columnsOrder}
       />,
    },
  ];

  return (
    <Tabs className={styles.tabs}>
      <TabList scrollDebounceWait={200} aria-label="Test Runs Tabs">
        {TABS_CONFIG.map((tab) => (
          <Tab key={tab.label}>{tab.label}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {TABS_CONFIG.map((tab) => (
          <TabPanel key={tab.label}>
            <div className={styles.tabContent}>{tab.component}</div>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
}
