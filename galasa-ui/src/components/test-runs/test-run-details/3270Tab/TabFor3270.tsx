/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// (TODO: Delete me) Test run with 3270 terminal example: CEMTManagerIVT http://localhost:3000/test-runs/cdb-20ca574c-40cb-435e-8741-deec9097e4e2-1754114441408-C25051?tab=overview

'use client';
import React from 'react';
import TableOfScreenshots from './TableOfScreenshots';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';

export default function TabFor3270({
  runId,
}: {
  runId: string;
})  {
  

  return (
    <div className={styles.terminalScreenshotTableContainer}>
      <TableOfScreenshots 
        runId={runId}
      />
    </div>
  );
}
