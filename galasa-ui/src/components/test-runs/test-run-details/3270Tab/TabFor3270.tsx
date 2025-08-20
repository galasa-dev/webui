/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// (TODO: Delete me) Test run with 3270 terminal example: CEMTManagerIVT http://localhost:3000/test-runs/cdb-20ca574c-40cb-435e-8741-deec9097e4e2-1754114441408-C25051?tab=overview

'use client';
import React, { useState } from 'react';
import TableOfScreenshots from '@/components/test-runs/test-run-details/3270Tab/TableOfScreenshots';
import DisplayTerminalScreenshot from '@/components/test-runs/test-run-details/3270Tab/DisplayTerminalScreenshot';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TreeNodeData } from '@/utils/functions/artifacts';
import ErrorPage from '@/app/error/page';

export default function TabFor3270({
  runId,
  zos3270TerminalData,
}: {
  runId: string;
  zos3270TerminalData: TreeNodeData[];
}) {
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageData, setImageData] = useState<any>([]);

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.tab3270Container}>
      <div className={styles.tableOfScreenshotsContainer}>
        <TableOfScreenshots
          runId={runId}
          zos3270TerminalData={zos3270TerminalData}
          isLoading={isLoading}
          setIsError={setIsError}
          setIsLoading={setIsLoading}
          setImageData={setImageData}
        />
      </div>

      <DisplayTerminalScreenshot imageData={imageData} isLoading={isLoading} />
    </div>
  );
}
