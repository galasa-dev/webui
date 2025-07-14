/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";
import { Suspense } from "react";
import useHistoryBreadCrumbs from "@/hooks/useHistoryBreadCrumbs";

interface TestRunsDetailsProps {
    requestorNamesPromise: Promise<string[]>;
    resultsNamesPromise: Promise<string[]>;
}

export default function TestRunsDetails({requestorNamesPromise, resultsNamesPromise}: TestRunsDetailsProps) {
  const { breadCrumbItems } = useHistoryBreadCrumbs();
      
  return(
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