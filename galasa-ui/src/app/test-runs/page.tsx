/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsTabs from "@/components/test-runs/TestRunsTabs";
import styles from "@/styles/TestRunsPage.module.css";
import ServerResultsContent from "@/components/test-runs/ServerResultsContent";


export default function TestRunsPage() {
  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <div className={styles.testRunsContentWrapper}>
        <TestRunsTabs resultsContent={<ServerResultsContent />}/>
      </div>
    </main>   
  );
};
