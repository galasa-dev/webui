/*
* Copyright contributors to the Galasa project
*
* SPDX-License-Identifier: EPL-2.0
*/

import { fetchUserLoginId } from '@/actions/userServerActions';
import { fetchMyTestRunsForLastDay  } from '@/actions/getTestRuns';
import TestRunsTable from './TestRunsTable';

export default async function ServerResultsContent() {
 const loginId = await fetchUserLoginId();
 const runs = loginId ? await fetchMyTestRunsForLastDay (loginId) : [];

 if (runs.length === 0) {
   return <p>No test runs found for your user in the last 24 hours.</p>;
 }

 return <TestRunsTable runs={runs} />;
}