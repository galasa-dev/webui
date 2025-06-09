/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

 
import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@carbon/react'; 
import styles from '@/styles/TestRunsPage.module.css';

type TabLabel = 'Timeframe' | 'Table Design' | 'Search Criteria' | 'Results';
interface TabConfig {
    label: TabLabel;
    component: React.ReactNode;
}

// Currently, the content for each tab is static and under construction.
const TimeFrameContent = () => <p className={styles.tabContent}>
    This page is under construction. Currently, all results for the last 24 hours are shown in the Results tab.
</p>;

const TableDesignContent = () => <p className={styles.tabContent}>
    This page is under construction. In future, you will be able to choose which columns are visible and their order.
</p>;

const SearchCriteriaContent = () => <p className={styles.tabContent}>
    This page is under construction. Define specific search criteria to filter the results below.
</p>;

const ResultsContent = () => <p className={styles.tabContent}>
    Results will be displayed here based on the selected timeframe and search criteria.
</p>;

// Define the tabs with their corresponding content.
const TABS_CONFIG: TabConfig[] = [
  {label: 'Timeframe', component: <TimeFrameContent />},
  {label: 'Table Design', component: <TableDesignContent />},
  {label: 'Search Criteria', component: <SearchCriteriaContent />},
  {label: 'Results', component: <ResultsContent />},
];

export default function TestRunsTabs() {
  return (
    <Tabs>
      <TabList scrollDebounceWait={200}>
        {TABS_CONFIG.map((tab) => (
          <Tab key={tab.label}>{tab.label}</Tab>
        ))}
      </TabList>
      <TabPanels>
        {TABS_CONFIG.map((tab) => (
          <TabPanel key={tab.label}>
            {tab.component}
          </TabPanel>
        ))}
      </TabPanels>
    </Tabs>
  );
};