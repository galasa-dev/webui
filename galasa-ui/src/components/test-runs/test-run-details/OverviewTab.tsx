/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import React, { useEffect, useState, useMemo } from 'react';
import styles from '@/styles/test-runs/test-run-details/OverviewTab.module.css';
import InlineText from './InlineText';
import { RunMetadata } from '@/utils/interfaces';
import { useTranslations } from 'next-intl';
import { Link, InlineNotification, FilterableMultiSelect, Modal } from '@carbon/react';
import { Launch, Edit } from '@carbon/icons-react';
import { getAWeekBeforeSubmittedTime } from '@/utils/timeOperations';
import useHistoryBreadCrumbs from '@/hooks/useHistoryBreadCrumbs';
import { TEST_RUNS_QUERY_PARAMS } from '@/utils/constants/common';
import { TIME_TO_WAIT_BEFORE_CLOSING_TAG_EDIT_MODAL_MS } from '@/utils/constants/common';
import RenderTags from '@/components/test-runs/test-run-details/RenderTags';
import { updateRunTags, getExistingTagObjects } from '@/actions/runsAction';

type SimpleTagType = {
  id: string;
  label: string;
};

const OverviewTab = ({ metadata }: { metadata: RunMetadata }) => {
  const translations = useTranslations('OverviewTab');
  const { pushBreadCrumb } = useHistoryBreadCrumbs();

  const [weekBefore, setWeekBefore] = useState<string | null>(null);

  const [tags, setTags] = useState<string[]>(metadata?.tags || []);
  const [existingTagObjectNames, setexistingTagObjectNames] = useState<string[]>([]);

  const [isTagsEditModalOpen, setIsTagsEditModalOpen] = useState<boolean>(false);
  const [filterInput, setFilterInput] = useState<string>('');
  const [stagedTags, setStagedTags] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{
    kind: 'success' | 'error';
    title: string;
    subtitle: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fullTestName = metadata?.testName;
  const OTHER_RECENT_RUNS = `/test-runs?${TEST_RUNS_QUERY_PARAMS.TEST_NAME}=${fullTestName}&${TEST_RUNS_QUERY_PARAMS.BUNDLE}=${metadata?.bundle}&${TEST_RUNS_QUERY_PARAMS.PACKAGE}=${metadata?.package}&${TEST_RUNS_QUERY_PARAMS.DURATION}=60,0,0&${TEST_RUNS_QUERY_PARAMS.TAB}=results&${TEST_RUNS_QUERY_PARAMS.QUERY_NAME}=Recent runs of test ${metadata?.testName}`;
  const RETRIES_FOR_THIS_TEST_RUN = `/test-runs?${TEST_RUNS_QUERY_PARAMS.SUBMISSION_ID}=${metadata?.submissionId}&${TEST_RUNS_QUERY_PARAMS.FROM}=${weekBefore}&${TEST_RUNS_QUERY_PARAMS.TAB}=results&${TEST_RUNS_QUERY_PARAMS.QUERY_NAME}=All attempts of test run ${metadata?.runName}`;

  useEffect(() => {
    const fetchExistingTags = async () => {
      try {
        const result = await getExistingTagObjects();
        setexistingTagObjectNames(result.tags || []);

        if (!result.success) {
          console.error('Failed to fetch existing tags:', result.error);
        }
      } catch (error) {
        console.error('Error fetching existing tags:', error);
      }
    };
    fetchExistingTags();
  }, []);

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
    // Push the current URL to the breadcrumb history.
    pushBreadCrumb({
      title: `${metadata.runName}`,
      route: `/test-runs/${metadata.runId}`,
    });
  };

  const handleTagRemove = (tag: string) => {
    setStagedTags((prev) => {
      const newSet = new Set(prev);
      newSet.delete(tag);
      return newSet;
    });
  };

  const handleFilterableMultiSelectChange = (selectedItems: SimpleTagType[]) => {
    // Update staged tags based on selected items
    const newStagedTags = new Set(selectedItems.map((item) => item.label));
    setStagedTags(newStagedTags);
  };

  // Create items for FilterableMultiSelect.
  const filterableItems = useMemo(() => {
    const itemsSet = new Set<string>();

    // Collect all unique tag names.
    stagedTags.forEach((tagName) => itemsSet.add(tagName));
    existingTagObjectNames.forEach((tagName) => itemsSet.add(tagName));

    // Add the current filter input if it's not empty and not already in the list.
    if (filterInput.trim() && !itemsSet.has(filterInput.trim())) {
      itemsSet.add(filterInput.trim());
    }

    // Convert to array and sort alphabetically.
    const sortedTags = Array.from(itemsSet).sort((a, b) =>
      a.toLowerCase().localeCompare(b.toLowerCase())
    );

    // Create items with consistent IDs based on sorted order.
    return sortedTags.map((tagName, index) => ({
      id: `tag-${index}-${tagName}`,
      label: tagName,
    }));
  }, [existingTagObjectNames, stagedTags, filterInput]);

  // Get initially selected items based on staged tags.
  const initialSelectedItems = useMemo(() => {
    return filterableItems.filter((item) => stagedTags.has(item.label));
  }, [filterableItems, stagedTags]);

  const handleModalClose = () => {
    setIsTagsEditModalOpen(false);
    setFilterInput('');
    setNotification(null);
  };

  const handleSaveTags = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      // Call the server action to update tags using the staged tags Set.
      const result = await updateRunTags(metadata.runId, Array.from(stagedTags));

      if (!result.success) {
        throw new Error(result.error || 'Failed to update tags');
      }

      setNotification({
        kind: 'success',
        title: translations('updateSuccess'),
        subtitle: translations('updateSuccessMessage'),
      });

      // Set tags of the component to the staged tags tags.
      setTags(Array.from(stagedTags));

      // Close modal after a short delay to show success message.
      setTimeout(() => {
        handleModalClose();
      }, TIME_TO_WAIT_BEFORE_CLOSING_TAG_EDIT_MODAL_MS);
    } catch (error: any) {
      console.error('Failed to update tags:', error);
      setNotification({
        kind: 'error',
        title: translations('updateError'),
        subtitle: error.message || translations('updateErrorMessage'),
      });
    } finally {
      setIsSaving(false);
    }
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
      <InlineText title={`${translations('user')}:`} value={metadata?.user} />

      <div className={styles.infoContainer}>
        <InlineText title={`${translations('submitted')}:`} value={metadata?.submitted} />
        <InlineText title={`${translations('started')}:`} value={metadata?.startedAt} />
        <InlineText title={`${translations('finished')}:`} value={metadata?.finishedAt} />
        <InlineText title={`${translations('duration')}:`} value={metadata?.duration} />
      </div>

      <div className={styles.tagsSection}>
        <h5>
          {translations('tags')}

          <div
            className={styles.tagsEditButtonWrapper}
            onClick={() => {
              // Initialize staged tags from current tags when opening modal
              setStagedTags(new Set(tags));
              setIsTagsEditModalOpen(true);
            }}
          >
            <Edit className={styles.tagsEditButton} />
          </div>
        </h5>
        <RenderTags tags={tags} isDismissible={false} size="md" />

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

      <Modal
        open={isTagsEditModalOpen}
        onRequestClose={handleModalClose}
        modalHeading={`${translations('modalHeading')} ${metadata?.runName || ''}`}
        primaryButtonText={translations('modalPrimaryButton')}
        secondaryButtonText={translations('modalSecondaryButton')}
        onRequestSubmit={handleSaveTags}
        primaryButtonDisabled={isSaving}
        className={styles.tagsEditModal}
      >
        {notification && (
          <InlineNotification
            className={styles.notification}
            kind={notification.kind}
            title={notification.title}
            subtitle={notification.subtitle}
            lowContrast
            hideCloseButton={false}
            onCloseButtonClick={() => setNotification(null)}
          />
        )}
        <FilterableMultiSelect
          id="tags-filterable-multiselect"
          titleText={translations('modalLabelText')}
          placeholder={translations('modalPlaceholderText')}
          items={filterableItems}
          initialSelectedItems={initialSelectedItems}
          itemToString={(item: SimpleTagType | null) => (item ? item.label : '')}
          selectionFeedback="top-after-reopen"
          selectedItems={initialSelectedItems}
          onChange={({ selectedItems }: { selectedItems: SimpleTagType[] }) => {
            handleFilterableMultiSelectChange(selectedItems);
          }}
          onInputValueChange={(inputValue: string) => {
            setFilterInput(inputValue);
          }}
          className={styles.tagsTextInput}
        />
        <RenderTags
          tags={Array.from(stagedTags)}
          isDismissible={true}
          size="lg"
          onTagRemove={handleTagRemove}
        />
      </Modal>
    </>
  );
};

export default OverviewTab;
