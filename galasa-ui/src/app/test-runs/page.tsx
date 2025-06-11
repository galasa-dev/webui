/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { fetchAllTestRunsForLastDay } from "@/actions/getTestRuns";
import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";
import { Suspense } from "react";
import { Loading } from "@carbon/react";


export default async function TestRunsPage() {
  const runs = await fetchAllTestRunsForLastDay();

  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <Suspense fallback={<p>Loading...</p>}>
          <TestRunsTabs runs={runs}/>
        </Suspense>
      </div>
    </main>   
  );
}
