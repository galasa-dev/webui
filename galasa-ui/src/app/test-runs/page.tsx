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
import { getYesterday } from "@/utils/timeOperations";
import { CLIENT_API_VERSION, MAX_RECORDS } from "@/utils/constants/common";

const BATCH_SIZE = 100; // Define the batch size for fetching runs

/**
 * The structure returned by the data fetching function.
 */
export interface TestRunsData {
  runs: Run[];
  limitExceeded: boolean;
}

interface fetchAllTestRunsByPagingParams {
  fromDate: Date;
  toDate: Date;
  testRunName?: string;
}


/**
 * Fetches all test runs from the Result Archive Store API within a specified date range
 * by repeatedly calling the API until all runs are retrieved.
 * 
 * @param {Object} params 
 * @param {Date} params.fromDate - The start date for fetching runs.
 * @param {Date} params.toDate - The end date for fetching runs.
 * 
 * @returns {Promise<TestRunsData>} - A promise that resolves to an object containing the runs and a flag indicating if the limit was reached.
 */
const fetchAllTestRunsByPaging  = async ({fromDate, toDate, testRunName}: fetchAllTestRunsByPagingParams): Promise<TestRunsData> => {
  let allRuns = [] as Run[];
  let currentCursor: string | undefined = undefined;
  let hasMorePages = true;
  let limitExceeded = false;

  if (fromDate > toDate) return {runs: [] , limitExceeded};

  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    while (hasMorePages && allRuns.length < MAX_RECORDS) {
      // Fetch runs based on the provided date range
      const response: RunResults = await rasApiClient.getRasSearchRuns(
        'from:desc',
        CLIENT_API_VERSION,
        undefined, // result
        undefined, // status
        undefined, // bundle
        undefined, // requestor
        fromDate, 
        toDate,  
        undefined, // testname
        undefined, // page
        BATCH_SIZE, 
        undefined, // runId
        testRunName, // runname
        undefined, // group
        undefined, // submissionId
        undefined, // detail
        undefined, // tags
        'true',    // includeCursor
        currentCursor
      );

      const runsInBatch = response.runs || [];
      if (runsInBatch.length > 0) {
        allRuns.push(...structuredClone(runsInBatch));
      }

      // Check if the limit was exceeded
      if (allRuns.length >= MAX_RECORDS) {
        limitExceeded = true;
        allRuns = allRuns.slice(0, MAX_RECORDS); // Trim to max records
        hasMorePages = false; // Stop fetching more runs
        break;
      }

      const nextCursor = response.nextCursor;
      // Check condition to stop looping
      if (!nextCursor || 
        nextCursor === currentCursor 
        || runsInBatch.length < BATCH_SIZE) {
        hasMorePages = false; 
      } else {
        currentCursor = nextCursor; // Update cursor for next iteration
      }
      
    }
  } catch (error: any) {
    console.error("Error fetching test runs:", error);
  }
  
  return {runs: allRuns, limitExceeded };
};

export default async function TestRunsPage({searchParams}: {searchParams: {[key: string]: string | undefined}} ) {
  const fromDate = searchParams?.from ? new Date(searchParams.from) : getYesterday();
  const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();
  const testRunName = searchParams?.runName ? searchParams.runName : undefined;

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile translationKey={"TestRun.title"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs runsListPromise={fetchAllTestRunsByPaging({fromDate, toDate, testRunName})}/>
        </Suspense>
      </div>
    </main>
  );
}
