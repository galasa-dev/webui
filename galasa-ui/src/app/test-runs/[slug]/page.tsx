/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import TestRunDetails from '@/components/runs/TestRunDetails';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import { ArtifactIndexEntry, ResultArchiveStoreAPIApi, Run } from '@/generated/galasaapi';
import NotFound from '@/components/common/NotFound';
import ErrorPage from '@/app/error/page';

// Define an interface for the component's props
interface TestRunProps {
  params: {
    slug: string;
  };
}

// Type the props directly on the function's parameter
export default async function TestRunPage ({ params: { slug } }: TestRunProps) {

  const apiConfig = createAuthenticatedApiConfiguration();

  const fetchRunDetailsFromApiServer = async () => {
    try {
      const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
      const rasRunsResponse = await rasApiClient.getRasRunById(slug);
      return structuredClone(rasRunsResponse);
    } catch (error: any) {
      console.error("Error fetching run details:", error);
      throw error;
    }
  };

  const fetchRunDetailLogs = async () => {
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
    const rasRunLogsResponse = await rasApiClient.getRasRunLog(slug);
    return rasRunLogsResponse;
  };

  const fetchTestArtifacts = async (): Promise<ArtifactIndexEntry[]> => {
    let runArtifacts: ArtifactIndexEntry[] = [];

    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
    const rasArtifactResponse = await rasApiClient.getRasRunArtifactList(slug);

    if (rasArtifactResponse) {
      runArtifacts = structuredClone(Array.from(rasArtifactResponse)); //Convert the set into array
    }

    return runArtifacts;
  };

  // Check if run exists first
  try {
    await fetchRunDetailsFromApiServer();
  } catch (error: any) {
    if (error?.code === 404) {
      return <NotFound title='Run not found' description={`Unable to find a run with id: ${slug}`}/>;
    } else{
      return <ErrorPage />;
    }
    throw error; // Re-throw other errors
  }

  return (
    <TestRunDetails 
      runId={slug} 
      runDetailsPromise={fetchRunDetailsFromApiServer()} 
      runArtifactsPromise={fetchTestArtifacts()} 
      runLogPromise={fetchRunDetailLogs()} 
    />
  );
};