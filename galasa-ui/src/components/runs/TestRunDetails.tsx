/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import TestRunBreadCrumb from '@/components/common/TestRunBreadCrumb';
import PageTile from '@/components/PageTile';
import { Tab, Tabs, TabList, TabPanels, TabPanel, Loading } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import styles from "@/styles/TestRun.module.css";
import { Dashboard, Code, CloudLogging, RepoArtifact } from '@carbon/icons-react';
import OverviewTab from './OverviewTab';
import InlineText from './InlineText';
import { ArtifactIndexEntry, Run, TestMethod } from '@/generated/galasaapi';
import ErrorPage from '@/app/error/page';
import { RunMetadata } from '@/utils/interfaces';
import { getIsoTimeDifference, parseIsoDateTime } from '@/utils/functions';
import MethodsTab from './MethodsTab';
import StatusCheck from '../common/StatusCheck';
import { ArtifactsTab } from './ArtifactsTab';
import LogTab from './LogTab';

interface TestRunDetailsProps {
  runId: string;
  runDetails: Run;
  runLog: string;
  runArtifacts: ArtifactIndexEntry[];
}

// Type the props directly on the function's parameter
const TestRunDetails = ({ runId, runDetails, runLog, runArtifacts }: TestRunDetailsProps) => {

  const [run, setRun] = useState<RunMetadata>();
  const [methods, setMethods] = useState<TestMethod[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactIndexEntry[]>([]);
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);


  const extractRunDetails = (runDetails: Run) => {

    setMethods(runDetails.testStructure?.methods || []);

    // Build run metadata object
    const runMetadata: RunMetadata = {

      runId: runId,
      result: runDetails.testStructure?.result!,
      status: runDetails.testStructure?.status!,
      runName: runDetails.testStructure?.runName!,
      testName: runDetails.testStructure?.testShortName!,
      bundle: runDetails.testStructure?.bundle!,
      submissionId: runDetails.testStructure?.submissionId!,
      group: runDetails.testStructure?.group!,
      requestor: runDetails.testStructure?.requestor!,
      submitted: parseIsoDateTime(runDetails.testStructure?.queued!),
      startedAt: parseIsoDateTime(runDetails.testStructure?.startTime!),
      finishedAt: parseIsoDateTime(runDetails.testStructure?.endTime!),
      duration: getIsoTimeDifference(runDetails.testStructure?.startTime!, runDetails.testStructure?.endTime!),
      tags: runDetails.testStructure?.tags!

    };

    setRun(runMetadata);

  };

  useEffect(() => {

    setIsLoading(true);

    try {

      if (runDetails) {
        extractRunDetails(runDetails);
        setArtifacts(runArtifacts);
        setLogs(runLog);
      }

    } catch (err) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }

  }, [runDetails, runArtifacts, runLog]);

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <Loading small={false} active={isLoading} />;
  }

  return (
    <main id="content">

      <TestRunBreadCrumb />
      <PageTile title={`Test Run: ${run?.runName}`} />

      <div className={styles.testRunContainer}>

        <div className={styles.summarySection}>

          <div>
            <span className={styles.summaryStatus}>
              Status: {run?.status}
            </span>
            <span className={styles.summaryStatus}>
              Result: <StatusCheck status={run?.result!}></StatusCheck>
            </span>
          </div>

          <span className={styles.summaryStatus}>
            Test: {run?.testName}
          </span>

        </div>

        <Tabs>
          <TabList iconSize="lg" className={styles.tabs}>
            <Tab renderIcon={Dashboard} href="#">Overview</Tab>
            <Tab renderIcon={Code} href="#">Methods</Tab>
            <Tab renderIcon={CloudLogging} href="#">Run Log</Tab>
            <Tab renderIcon={RepoArtifact} href="#">Artifacts</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <OverviewTab metadata={run!} />
            </TabPanel>
            <TabPanel>
              <MethodsTab methods={methods} />
            </TabPanel>
            <TabPanel>
              <LogTab logs={logs} />
            </TabPanel>
            <TabPanel>
              <ArtifactsTab artifacts={artifacts} runId={runId} runName={run?.runName!} />
            </TabPanel>
          </TabPanels>
        </Tabs>

      </div>
    </main>
  );
};

export default TestRunDetails;