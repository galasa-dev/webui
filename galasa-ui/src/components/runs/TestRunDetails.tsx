/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import BreadCrumb from '@/components/common/BreadCrumb';
import PageTile from '@/components/PageTile';
import { Tab, Tabs, TabList, TabPanels, TabPanel, Loading } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import styles from "@/styles/TestRun.module.css";
import { Dashboard, Code, CloudLogging, RepoArtifact } from '@carbon/icons-react';
import OverviewTab from './OverviewTab';
import { ArtifactIndexEntry, Run, TestMethod } from '@/generated/galasaapi';
import ErrorPage from '@/app/error/page';
import { RunMetadata } from '@/utils/interfaces';
import { getIsoTimeDifference, parseIsoDateTime } from '@/utils/timeOperations';
import MethodsTab from './MethodsTab';
import { ArtifactsTab } from './ArtifactsTab';
import LogTab from './LogTab';
import { HOME, TEST_RUNS } from '@/utils/constants/breadcrumb';
import TestRunSkeleton from './TestRunSkeleton';
import StatusCheck from '../common/StatusCheck';
import { useTranslations } from 'next-intl';

interface TestRunDetailsProps {
  runId: string;
  runDetailsPromise: Promise<Run>;
  runLogPromise: Promise<string>;
  runArtifactsPromise: Promise<ArtifactIndexEntry[]>;
}

// Type the props directly on the function's parameter
const TestRunDetails = ({ runId, runDetailsPromise, runLogPromise, runArtifactsPromise }: TestRunDetailsProps) => {

  const [run, setRun] = useState<RunMetadata>();
  const [methods, setMethods] = useState<TestMethod[]>([]);
  const [artifacts, setArtifacts] = useState<ArtifactIndexEntry[]>([]);
  const [logs, setLogs] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const translations = useTranslations("TestRunDetails");

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
    const loadRunDetails = async () => {
      setIsLoading(true);

      try {
        const runDetails = await runDetailsPromise;
        const runArtifacts = await runArtifactsPromise;
        const runLog = await runLogPromise;

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
    };

    loadRunDetails();
  }, [runDetailsPromise, runArtifactsPromise, runLogPromise]);

  if (isError) {
    return <ErrorPage />;
  }
  

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME, TEST_RUNS]} />
      <PageTile
        translationKey={translations("title", {
          runName: run?.runName || "Unknown Run Name",
        })}
      />

      {isLoading ? (
        <TestRunSkeleton />
      ) : (
        <div className={styles.testRunContainer}>
          <div className={styles.summarySection}>
            <div>
              <span className={styles.summaryStatus}>
                {translations("status")}: {run?.status}
              </span>
              <span className={styles.summaryStatus}>
                {translations("result")}: <StatusCheck status={run?.result!} />
              </span>
            </div>
            <span className={styles.summaryStatus}>
              {translations("test")}: {run?.testName}
            </span>
          </div>
          <Tabs>
            <TabList iconSize="lg" className={styles.tabs}>
              <Tab renderIcon={Dashboard} href="#">
                {translations("tabs.overview")}
              </Tab>
              <Tab renderIcon={Code} href="#">
                {translations("tabs.methods")}
              </Tab>
              <Tab renderIcon={CloudLogging} href="#">
                {translations("tabs.runLog")}
              </Tab>
              <Tab renderIcon={RepoArtifact} href="#">
                {translations("tabs.artifacts")}
              </Tab>
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
                <ArtifactsTab
                  artifacts={artifacts}
                  runId={runId}
                  runName={run?.runName!}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </div>
      )}
    </main>
  );
};

export default TestRunDetails;
