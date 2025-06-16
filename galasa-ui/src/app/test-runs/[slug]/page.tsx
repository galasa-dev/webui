/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import TestRunDetails from '@/components/runs/TestRunDetails';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import { ArtifactIndexEntry, ResultArchiveStoreAPIApi, Run } from '@/generated/galasaapi';
import ErrorPage from '@/app/error/page';

// Define an interface for the component's props
interface TestRunProps {
  params: {
    slug: string;
  };
}

export default async function TestRunsPage ({ params: { slug } }: TestRunProps) {

  const apiConfig = createAuthenticatedApiConfiguration();

  let runDetails: Run | null = null;
  let runArtifacts: ArtifactIndexEntry[] = [];
  let runLogs: any = null;
  let error: string | null = null;

  try {
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    // Fetch all data in parallel
    const [details, artifacts, logs] = await Promise.all([
      rasApiClient.getRasRunById(slug),
      rasApiClient.getRasRunArtifactList(slug),
      rasApiClient.getRasRunLog(slug),
    ]);

    runDetails = details ? structuredClone(details) : null;
    runArtifacts = artifacts ? structuredClone(Array.from(artifacts)) : [];
    runLogs = logs;
  } catch (err: any) {
    error = err?.message || "Failed to load test run data.";
  }

  if (error) {
    return <ErrorPage />;
  }

  return (
    <TestRunDetails 
      runId={slug} 
      runDetails={runDetails!}
      runArtifacts={runArtifacts} 
      runLog={runLogs}
    />
  );
};