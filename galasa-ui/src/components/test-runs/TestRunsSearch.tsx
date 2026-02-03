/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import styles from '@/styles/test-runs/TestRunsSearch.module.css';
import { NotificationType } from '@/utils/types/common';
import { Search } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { TestRunsData } from '@/utils/testRuns';
import { NOTIFICATION_VISIBLE_MILLISECS } from '@/utils/constants/common';
import { Button } from '@carbon/react';
import { InlineNotification } from '@carbon/react';

export default function TestRunsSearch() {
  const router = useRouter();
  const translations = useTranslations('TestRunsDetails');

  const [currentSearchInput, setCurrentSearchInput] = useState('');
  const [goButtonDisabled, setGoButtonDisabled] = useState(true);
  const [searchNotification, setSearchNotification] = useState<NotificationType | null>(null);

  // Execute the search for test runs by run name using the Search input
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const searchRunName = currentSearchInput.toUpperCase();
    const url = new URL(`/internal-api/test-runs?runName=${searchRunName}`, window.location.origin);
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `Server responded with status ${response.status}`);
    }

    const testRunsData = (await response.json()) as TestRunsData;
    const runs = testRunsData.runs;
    if (runs.length === 0) {
      setSearchNotification({
        kind: 'info',
        title: translations('infoTitle'),
        subtitle: translations('noTestRunsFoundMessage'),
      });
      setTimeout(() => setSearchNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
    } else if (runs.length === 1) {
      // Navigate to the test run details page for this run
      let runId = runs[0].runId;
      router.push(`/test-runs/${runId}`);
    } else {
      // Re-runs were found
      // Navigate to the test run details page for the latest try of this run
      const latestRun = runs.reduce((latest, current) => {
        const latestTime = new Date(latest.testStructure?.startTime ?? '').getTime();
        const currentTime = new Date(current.testStructure?.startTime ?? '').getTime();
        return currentTime > latestTime ? current : latest;
      });
      let runId = latestRun.runId;
      router.push(`/test-runs/${runId}`);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSearchInput(event.target.value);
    if (event.target.value === '') {
      setGoButtonDisabled(true);
    } else {
      setGoButtonDisabled(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <form onSubmit={onSubmit}>
        <div className={styles.searchAndButton}>
          <Search
            id="search-input"
            className={styles.search}
            placeholder={translations('searchTextPlaceholder')}
            size="md"
            type="text"
            onChange={handleSearchChange}
          />
          <Button className={styles.button} type="submit" size="md" disabled={goButtonDisabled}>
            {translations('searchButtonLabel')}
          </Button>
          {searchNotification && (
            <div className={styles.notification}>
              <InlineNotification
                title={searchNotification.title}
                subtitle={searchNotification.subtitle}
                kind={searchNotification.kind}
                hideCloseButton={true}
              />
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
