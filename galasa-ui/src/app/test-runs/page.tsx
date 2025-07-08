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
import { getRequestorList, getResultsNames } from '@/utils/testRuns';


export default async function TestRunsPage({searchParams}: {searchParams: { [key: string]: string }}) {
  const requestorNamesPromise = getRequestorList();
  const resultsNamesPromise = getResultsNames();

  const fromRunName = searchParams.fromRunName || "";
  const fromRunId = searchParams.fromRunId || "";
  
  const breadCrumbItems = fromRunName ? 
    [HOME, 
      {
        title: "testRuns",
        route: `/test-runs?${new URLSearchParams(searchParams).toString()}`,
      },
      {
        title: "testRunName",
        values: { runName: fromRunName },
        route: `/test-runs/${fromRunId}`,
      }
    ] : [HOME];

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={breadCrumbItems} />
      <PageTile translationKey={"TestRun.title"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs
            requestorNamesPromise={requestorNamesPromise}
            resultsNamesPromise={resultsNamesPromise}
          />
        </Suspense>
      </div>
    </main>
  );
}