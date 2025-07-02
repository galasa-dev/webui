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
import { getYesterday } from "@/utils/timeOperations";
import { fetchAllTestRunsByPaging, getRequestorList, getResultsNames } from '@/utils/testRuns';


export default async function TestRunsPage({searchParams}: {searchParams: {[key: string]: string | undefined}} ) {
  const fromDate = searchParams?.from ? new Date(searchParams.from) : getYesterday();
  const toDate = searchParams?.to ? new Date(searchParams.to) : new Date();
  const { runName, requestor, group, submissionId, bundle, testName, result, tags } = searchParams || {};
  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile translationKey={"TestRun.title"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs 
            runsListPromise={fetchAllTestRunsByPaging({fromDate, toDate, runName, requestor, group, submissionId, bundle, testName, result, tags})} 
            requestorNamesPromise={getRequestorList()} 
            resultsNamesPromise={getResultsNames()} 
          />
        </Suspense>
      </div>
    </main>
  );
}