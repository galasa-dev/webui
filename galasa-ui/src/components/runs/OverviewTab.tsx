/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react';
import styles from "@/styles/OverviewTab.module.css";
import InlineText from './InlineText';
import { Tag } from '@carbon/react';
import { RunMetadata } from '@/utils/interfaces';

const OverviewTab = ({ metadata }: { metadata: RunMetadata }) => {
  const tags = metadata?.tags || [];

  return (
    <>
      <InlineText title='Bundle:' value={metadata?.bundle} />
      <InlineText title='Test:' value={metadata?.testName} />
      <InlineText title='Group:' value={metadata?.group} />
      <InlineText title='Submission ID:' value={metadata?.submissionId} />
      <InlineText title='Requestor:' value={metadata?.requestor} />

      <div className={styles.infoContainer}>
        <InlineText title='Submitted:' value={metadata?.submitted} />
        <InlineText title='Started:' value={metadata?.startedAt} />
        <InlineText title='Finished:' value={metadata?.finishedAt} />
        <InlineText title='Duration:' value={metadata?.duration} />
      </div>

      <div className={styles.tagsSection}>
        <h5>Tags:</h5>
        <div className={styles.tagsContainer}>
          {tags?.length > 0 ? (
            tags?.map((tag, index) => (
              <Tag size="md" key={index}>{tag}</Tag>
            ))
          ) : (
            <p>No tags were associated with this test run.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OverviewTab;