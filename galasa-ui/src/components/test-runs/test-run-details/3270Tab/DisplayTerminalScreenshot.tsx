/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';

export default function DisplayTerminalScreenshot({
  imageData,
  isLoading,
}: {
  imageData:any;
  isLoading:boolean;
}) {


  if (isLoading) {
    return (
      <div>
        
      </div>
    );
  }

  return (
    <div>
      
    </div>
  );
}
