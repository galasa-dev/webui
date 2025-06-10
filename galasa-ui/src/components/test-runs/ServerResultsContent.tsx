/*
* Copyright contributors to the Galasa project
*
* SPDX-License-Identifier: EPL-2.0
*/
import { fetchMyTestRunsForLastDay  } from '@/actions/getTestRuns';
import TestRunsTable from './TestRunsTable';

export default async function ServerResultsContent() {
 const runs = await fetchMyTestRunsForLastDay ();

 if (runs.length === 0) {
   return <p>No test runs found for your user in the last 24 hours.</p>;
 }

 // Create a serializable version of the runs data
 const plainRuns = JSON.parse(JSON.stringify(runs));
 console.log("ServerResultsContent runs:", plainRuns);

 return <TestRunsTable runs={plainRuns} />;
}