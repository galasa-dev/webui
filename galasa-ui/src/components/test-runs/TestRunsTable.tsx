
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Run } from "@/generated/galasaapi";

interface ResultsTableProps {
  runs: Run[];
}

export default function TestRunsTable({runs}: ResultsTableProps) {
    console.log("ResultsTable runs:", runs);
  return (
   <div>This is the results table</div>
  );
}
