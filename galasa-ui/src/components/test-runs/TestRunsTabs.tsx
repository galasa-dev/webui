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
import { Run, TestRun } from '@/generated/galasaapi';
import { TestRunsData } from '@/app/test-runs/page';

type TabLabel = 'Timeframe' | 'Table Design' | 'Search Criteria' | 'Results';
interface TabConfig {
    label: TabLabel;
    component: React.ReactNode;
}

const TableDesignContent = () => <p>
    This page is under construction. In future, you will be able to choose which columns are visible and their order.
</p>;

const SearchCriteriaContent = () => <p>
    This page is under construction. Define specific search criteria to filter the results below.
</p>;


export default function TestRunsTabs({runsListPromise}: {runsListPromise: Promise<TestRunsData>}) {
  // Define the tabs with their corresponding content.
  const TABS_CONFIG: TabConfig[] = [
    {label: 'Timeframe', component: <TimeframeContent />},
    {label: 'Table Design', component: <TableDesignContent />},
    {label: 'Search Criteria', component: <SearchCriteriaContent />},
    {label: 'Results', component: <TestRunsTable runsListPromise={runsListPromise}/>},
  ];

  return (
    <Tabs className={styles.tabs}>
      <TabList scrollDebounceWait={200}>
        {TABS_CONFIG.map((tab) => (
          <Tab key={tab.label}>{tab.label}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {TABS_CONFIG.map((tab) => (
          <TabPanel key={tab.label}>
            <div className={styles.tabContent}>
              {tab.component}
            </div>
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};