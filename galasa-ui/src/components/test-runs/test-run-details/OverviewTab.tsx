/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/test-runs/test-run-details/OverviewTab.module.css';
import InlineText from './InlineText';
import { RunMetadata } from '@/utils/interfaces';
import { useTranslations } from 'next-intl';
import { Link } from '@carbon/react';
import { Launch, Edit } from '@carbon/icons-react';
import { getAWeekBeforeSubmittedTime } from '@/utils/timeOperations';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { TEST_RUNS_QUERY_PARAMS } from '@/utils/constants/common';
import { TextInput } from '@carbon/react';
import { Modal } from '@carbon/react';
import RenderTags from './RenderTags';

const OverviewTab = ({ metadata }: { metadata: RunMetadata }) => {
  const tags = metadata?.tags || [];
  const translations = useTranslations('OverviewTab');
  const { pushBreadCrumb } = useHistoryBreadCrumbs();

  const [weekBefore, setWeekBefore] = useState<string | null>(null);

  const [isTagsEditModalOpen, setIsTagsEditModalOpen] = useState<Boolean>(false);

  const fullTestName = metadata?.testName;
  const OTHER_RECENT_RUNS = `/test-runs?${TEST_RUNS_QUERY_PARAMS.TEST_NAME}=${fullTestName}&${TEST_RUNS_QUERY_PARAMS.BUNDLE}=${metadata?.bundle}&${TEST_RUNS_QUERY_PARAMS.PACKAGE}=${metadata?.package}&${TEST_RUNS_QUERY_PARAMS.DURATION}=60,0,0&${TEST_RUNS_QUERY_PARAMS.TAB}=results&${TEST_RUNS_QUERY_PARAMS.QUERY_NAME}=Recent runs of test ${metadata?.testName}`;
  const RETRIES_FOR_THIS_TEST_RUN = `/test-runs?${TEST_RUNS_QUERY_PARAMS.SUBMISSION_ID}=${metadata?.submissionId}&${TEST_RUNS_QUERY_PARAMS.FROM}=${weekBefore}&${TEST_RUNS_QUERY_PARAMS.TAB}=results&${TEST_RUNS_QUERY_PARAMS.QUERY_NAME}=All attempts of test run ${metadata?.runName}`;

  useEffect(() => {
    const validateTime = () => {
      const validatedTime = getAWeekBeforeSubmittedTime(metadata?.rawSubmittedAt!);
      if (validatedTime !== null) {
        setWeekBefore(validatedTime);
      }
    };

    validateTime();
  }, [metadata?.rawSubmittedAt]);

  const handleNavigationClick = () => {
    // Push the current URL to the breadcrumb history
    pushBreadCrumb({
      title: `${metadata.runName}`,
      route: `/test-runs/${metadata.runId}`,
    });
  };

  return (
    <>
      <InlineText title={`${translations('bundle')}:`} value={metadata?.bundle} />
      <InlineText title={`${translations('testName')}:`} value={metadata?.testName} />
      <InlineText title={`${translations('testShortName')}:`} value={metadata?.testShortName} />
      <InlineText title={`${translations('package')}:`} value={metadata?.package} />
      <InlineText title={`${translations('group')}:`} value={metadata?.group} />
      <InlineText title={`${translations('submissionId')}:`} value={metadata?.submissionId} />
      <InlineText title={`${translations('requestor')}:`} value={metadata?.requestor} />

      <div className={styles.infoContainer}>
        <InlineText title={`${translations('submitted')}:`} value={metadata?.submitted} />
        <InlineText title={`${translations('started')}:`} value={metadata?.startedAt} />
        <InlineText title={`${translations('finished')}:`} value={metadata?.finishedAt} />
        <InlineText title={`${translations('duration')}:`} value={metadata?.duration} />
      </div>

      <div className={styles.tagsSection}>
        <h5>
          {translations('tags')}

          <div className={styles.tagsEditWrapper} onClick={() => setIsTagsEditModalOpen(true)}>
            <Edit className={styles.tagsEditButton} />
          </div>
        </h5>
        <div className={styles.tagsContainer}>
          <RenderTags tags={tags} dismissible={false} size="md" />
        </div>

        <div className={styles.redirectLinks}>
          <div className={styles.linkWrapper} onClick={handleNavigationClick}>
            <Link href={OTHER_RECENT_RUNS} renderIcon={Launch} size="lg">
              {translations('recentRunsLink')}
            </Link>
          </div>
          {/* Only show the link if date is valid */}
          {weekBefore !== null && (
            <div className={styles.linkWrapper} onClick={handleNavigationClick}>
              <Link href={RETRIES_FOR_THIS_TEST_RUN} renderIcon={Launch} size="lg">
                {translations('runRetriesLink')}
              </Link>
            </div>
          )}
        </div>
      </div>

      {isTagsEditModalOpen && (
        <Modal
          open={true}
          onRequestClose={() => setIsTagsEditModalOpen(false)}
          modalHeading={`${translations('modalHeading')} ${metadata.runName}`}
          primaryButtonText={translations('modalPrimaryButton')}
          secondaryButtonText={translations('modalSecondaryButton')}
        >
          <TextInput
            data-modal-primary-focus
            id="text-input-1"
            labelText={translations('modalLabelText')}
            placeholder={translations('modalPlaceholderText')}
            style={{
              marginBottom: '24px',
            }}
          />
          <div className={styles.tagsContainer}>
            <RenderTags tags={tags} dismissible={true} size="lg" />
          </div>
        </Modal>
      )}
    </>
  );
};

export default OverviewTab;
