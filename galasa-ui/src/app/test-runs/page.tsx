/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";
import { HOME } from "@/utils/constants/breadcrumb";
import { Suspense } from "react";
import { ResultArchiveStoreAPIApi, Run, RunResults } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import {CLIENT_API_VERSION} from "@/utils/constants/common";

/**
 * Fetches test runs from the Result Archive Store (RAS) for the last 24 hours.
 * 
 * @returns {Promise<Run[]>} - A promise that resolves to an array of Run objects.
 */
const fetchAllTestRunsForLastDay  = async (): Promise<Run[]> => {
  let result = [] as Run[];
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
      
    // Calculate the date for 24 hours ago
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);
      
    // Fetch runs from the last 24 hours
    const response: RunResults = await rasApiClient.getRasSearchRuns(
      'from:desc',
      CLIENT_API_VERSION,
      undefined,
      undefined,
      undefined,
      undefined,
      fromDate,        
    );
      
    if(response && response.runs) {
      const plainRuns = structuredClone(response.runs);
      result = plainRuns as Run[];
    }
  } catch (error: any) {
    console.error("Error fetching test runs:", error);
  }

  return result;
};

export default async function TestRunsPage() {
  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs runsListPromise={fetchAllTestRunsForLastDay()}/>
        </Suspense>
      </div>
    </main>
  );
}