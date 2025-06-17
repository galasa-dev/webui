/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";
import { Suspense } from "react";
import { ResultArchiveStoreAPIApi, Run, RunResults } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import * as Constants from "@/utils/constants";
import { getYesterday } from "@/utils/functions";

const BATCH_SIZE = 100; // Define the batch size for fetching runs

/**
 * Fetches all test runs from the Result Archive Store API within a specified date range
 * by repeatedly calling the API until all runs are retrieved.
 * 
 * @param {Object} params 
 * @param {Date} params.fromDate - The start date for fetching runs.
 * @param {Date} params.toDate - The end date for fetching runs.
 * 
 * @returns {Promise<Run[]>} - A promise that resolves to an array of Run objects.
 */
const fetchAllTestRunsByPaging  = async ({fromDate, toDate}: {fromDate: Date, toDate: Date}): Promise<Run[]> => {
  let allRuns = [] as Run[];
  let currentCursor: string | undefined = undefined;
  let hasMorePages = true;

  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    while (hasMorePages) {
      // Fetch runs based on the provided date range
      const response: RunResults = await rasApiClient.getRasSearchRuns(
        'from:desc',
        Constants.CLIENT_API_VERSION,
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
        undefined, // runname
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
  
  return allRuns;
};

export default async function TestRunsPage({searchParams}: {searchParams: {[key: string]: string | undefined}} ) {
  const fromDate = searchParams?.from ? new Date(searchParams.from) : getYesterday();
  const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();

  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs runsListPromise={fetchAllTestRunsByPaging({fromDate, toDate})}/>
        </Suspense>
      </div>
    </main>   
  );
}
