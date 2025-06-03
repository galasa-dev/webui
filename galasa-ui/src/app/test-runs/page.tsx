/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageTile from "@/components/PageTile";
import BreadCrumb from "@/components/common/BreadCrumb";
import TestRunsContent from "@/components/test-runs/TestRunsContent";

export default function TestRunsPage() {
  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={"Test Runs"} />
      <TestRunsContent />
    </main>
  );
};
