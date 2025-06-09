/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";


export default function TestRunsPage() {
  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <TestRunsTabs />
      </div>
    </main>   
  );
};
