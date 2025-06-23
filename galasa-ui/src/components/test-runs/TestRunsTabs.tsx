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
import { TestRunsData } from '@/app/test-runs/page';
import { useTranslations } from "next-intl";

interface TabConfig {
  label: string;
  component: React.ReactNode;
}

interface TestRunsTabProps {
  runsListPromise: Promise<TestRunsData>;
  requestorNamesPromise: Promise<string[]>;
  resultsNamesPromise: Promise<string[]>;
}

const TableDesignContent = () => <p>
    This page is under construction. In future, you will be able to choose which columns are visible and their order.
</p>;



export default function TestRunsTabs({runsListPromise, requestorNamesPromise, resultsNamesPromise}: TestRunsTabProps) {
  const translations = useTranslations("TestRunsTabs");

  // Define the tabs with their corresponding content.
  const TABS_CONFIG: TabConfig[] = [
    {
      label: translations("tabs.timeframe"),
      component: <TimeframeContent />,
    },
    {
      label: translations("tabs.tableDesign"),
      component: <p>{translations("content.tableDesign")}</p>,
    },
    {
      label: translations("tabs.searchCriteria"),
      component: <SearchCriteriaContent requestorNamesPromise={requestorNamesPromise} resultsNamesPromise={resultsNamesPromise}/>,
    },
    {
      label: translations("tabs.results"),
      component: <TestRunsTable runsListPromise={runsListPromise} />,
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
