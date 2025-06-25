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
import { ResultArchiveStoreAPIApi, ResultNames, Run, RunResults } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { getYesterday } from "@/utils/timeOperations";
import { CLIENT_API_VERSION, MAX_RECORDS } from "@/utils/constants/common";
import { UserData } from '@/generated/galasaapi';
import { fetchAllUsersFromApiServer } from "../users/page";

// Define the batch size for fetching runs
const BATCH_SIZE = 100;

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
  requestor?: string;
  group?: string;
  submissionId?: string;
  bundle?: string;
  testName?: string;
  result?: string;
  tags?: string;
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
const fetchAllTestRunsByPaging  = async ({fromDate, toDate, testRunName, requestor, group, submissionId, bundle, testName, result, tags}: fetchAllTestRunsByPagingParams): Promise<TestRunsData> => {
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
        result,
        undefined, // status
        bundle, // bundle
        requestor, 
        fromDate, 
        toDate,  
        testName, 
        undefined, // page
        BATCH_SIZE, 
        undefined, // runId
        testRunName, 
        group, // group
        submissionId, // submissionId
        undefined, // detail
        tags, 
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

        // Trim to max records
        allRuns = allRuns.slice(0, MAX_RECORDS);

        // Stop fetching more runs
        hasMorePages = false; 
        break;
      }

      const nextCursor = response.nextCursor;
      // Check condition to stop looping
      if (!nextCursor || 
        nextCursor === currentCursor 
        || runsInBatch.length < BATCH_SIZE) {
        hasMorePages = false; 
      } else {
        // Update cursor for next iteration
        currentCursor = nextCursor; 
      }
      
    }
  } catch (error: any) {
    console.error("Error fetching test runs:", error);
  }
  console.log("Total runs fetched:", allRuns.length, "Limit exceeded:", limitExceeded);
  return {runs: allRuns, limitExceeded };
};

/**
 * Fetches a list of requestor names from the API server.
 * @returns {Promise<string[]>} - A promise that resolves to an array of requestor names.
 */

async function getRequestorList(): Promise<string[]> {
  try {
    const users: UserData[] = await fetchAllUsersFromApiServer();
    const requestorNames = users.map((user: UserData) => user.loginId);

    return requestorNames as string[];
  } catch (error) {
    console.error("Error fetching requestor list:", error);
    return [];
  }
}

async function getResultsNames(): Promise<string[]> {
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
    
    const resultsNamesResponse = await rasApiClient.getRasResultNames(
      CLIENT_API_VERSION,
      'results:asc'
    );

    const resultsNames = resultsNamesResponse?.resultnames ?? [];
    return resultsNames;

  } catch (error) {
    console.error("Error fetching results names:", error);
    return [];
  }
}

export default async function TestRunsPage({searchParams}: {searchParams: {[key: string]: string | undefined}} ) {
  const fromDate = searchParams?.from ? new Date(searchParams.from) : getYesterday();
  const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();
  const testRunName = searchParams?.runName ? searchParams.runName : undefined;
  const requestor = searchParams?.requestor ? searchParams.requestor : undefined;
  const group = searchParams?.group ? searchParams.group : undefined;
  const submissionId = searchParams?.submissionId ? searchParams.submissionId : undefined;
  const bundle = searchParams?.bundle ? searchParams.bundle : undefined;
  const testName = searchParams?.testName ? searchParams.testName : undefined;
  const result = searchParams?.result ? searchParams.result : undefined;
  const tags = searchParams?.tags ? searchParams.tags : undefined;
  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile translationKey={"TestRun.title"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs 
            runsListPromise={fetchAllTestRunsByPaging({fromDate, toDate, testRunName, requestor, group, submissionId, bundle, testName, result, tags})} 
            requestorNamesPromise={getRequestorList()} 
            resultsNamesPromise={getResultsNames()} 
          />
        </Suspense>
      </div>
    </main>
  );
}
