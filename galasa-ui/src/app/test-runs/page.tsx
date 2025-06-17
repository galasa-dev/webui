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

/**
 * Fetches test runs from the Result Archive Store (RAS) for the last 24 hours.
 * 
 * @returns {Promise<Run[]>} - A promise that resolves to an array of Run objects.
 */
const fetchAllTestRuns  = async ({fromDate, toDate}: {fromDate: Date, toDate: Date}): Promise<Run[]> => {
  let result = [] as Run[];
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
      
    // Fetch runs based on the provided date range
    const response: RunResults = await rasApiClient.getRasSearchRuns(
      'from:desc',
      Constants.CLIENT_API_VERSION,
      undefined,
      undefined,
      undefined,
      undefined,
      fromDate, 
      toDate,       
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

export default async function TestRunsPage({searchParams}: {searchParams: {[key: string]: string | undefined}} ) {
  const fromDate = searchParams?.from ? new Date(searchParams.from) : getYesterday();
  const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();

  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs runsListPromise={fetchAllTestRuns({fromDate, toDate})}/>
        </Suspense>
      </div>
    </main>   
  );
}
