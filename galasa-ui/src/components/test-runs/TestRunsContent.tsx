/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from "@/styles/TestRunsContent.module.css";

export default function TestRunsContent() {
  return (
    <div className={styles.testRunsContentWrapper}>
      <p className={styles.underConstruction}>
        This page is under construction. Please come back later to query a list of test runs.
      </p>
    </div>
  );
}