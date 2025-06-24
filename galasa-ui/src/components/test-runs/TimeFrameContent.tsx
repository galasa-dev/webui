/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { useState, useCallback, useEffect } from 'react';
import TimeFrameFilter from './TimeFrameFilter';
import { addMonths, combineDateTime, extractDateTimeForUI } from '@/utils/timeOperations';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { InlineNotification } from '@carbon/react';
import { MAX_RANGE_MONTHS, DAY_MS, HOUR_MS, MINUTE_MS } from '@/utils/constants/common';

type Notification = {
  text: string;
  kind: 'error' | 'warning';
};

/**
 * A hybrid function that both validates and corrects a date range.
 * It auto-corrects non-critical issues (like exceeding 'now') and returns a warning.
 * It returns a hard error for critical issues (like an inverted range).
 * @returns An object with the corrected dates and an optional notification object.
 */
export function applyTimeFrameRules(fromDate: Date, toDate: Date): { correctedFrom: Date; correctedTo: Date; notification: Notification | null } {
  let correctedFrom = new Date(fromDate.getTime());
  let correctedTo = new Date(toDate.getTime());
  let notification: Notification | null = null;

  if (correctedFrom > correctedTo) {
    console.error("Invalid date range: 'From' date is after 'To' date.");
    return {
      correctedFrom: fromDate,
      correctedTo: toDate,
      notification: {
        text: "'To' date cannot be before 'From' date.",
        kind: 'error',
      }
    };
  }

  const maxToDate = addMonths(correctedFrom, MAX_RANGE_MONTHS);
  if (correctedTo > maxToDate) {
    console.warn(`'To' date exceeds the maximum allowed range of ${MAX_RANGE_MONTHS} months from 'From' date.`);
    correctedTo = maxToDate;
    notification = {
      text: `Date range cannot exceed ${MAX_RANGE_MONTHS} months; 'To' date has been adjusted.`,
      kind: 'warning',
    };
  }

  const now = new Date();
  console.log('Current time:', now.toISOString());
  if (correctedTo > now) {
    console.warn("'To' date exceeds the current time, capping it at 'now'.");
    correctedTo = now;
    notification = {
      text: "Date range was capped at the current time.",
      kind: 'warning',
    };
  }


  return { correctedFrom, correctedTo, notification };
}

/**
 * Calculates the final, fully synchronized state object from two valid dates.
 */
export const calculateSynchronizedState = (fromDate: Date, toDate: Date): TimeFrameValues => {
  const fromUiParts = extractDateTimeForUI(fromDate);
  const toUiParts = extractDateTimeForUI(toDate);
  let difference = toDate.getTime() - fromDate.getTime();
  if (difference < 0) difference = 0;

  const durationDays = Math.floor(difference / DAY_MS);
  difference %= DAY_MS;
  const durationHours = Math.floor(difference / HOUR_MS);
  difference %= HOUR_MS;
  const durationMinutes = Math.floor(difference / MINUTE_MS);

  return { fromDate, fromTime: fromUiParts.time, fromAmPm: fromUiParts.amPm, toDate, toTime: toUiParts.time, toAmPm: toUiParts.amPm, durationDays, durationHours, durationMinutes };
};


export default function TimeFrameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const initializeState = (): TimeFrameValues => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const initialToDate = toParam ? new Date(toParam) : new Date();
    const initialFromDate = fromParam ? new Date(fromParam) : new Date(initialToDate.getTime() - DAY_MS);
    return calculateSynchronizedState(initialFromDate, initialToDate);
  };

  const [values, setValues] = useState<TimeFrameValues>(initializeState);
  const [notification, setNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set('from', values.fromDate.toISOString());
    params.set('to', values.toDate.toISOString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [values, pathname, router, searchParams]);

  const handleValueChange = useCallback((field: keyof TimeFrameValues, value: any) => {
    if ((field === 'fromDate' || field === 'toDate') && !value) {
      return;
    }

    setNotification(null);

    const draftValues = { ...values, [field]: value };

    let fromDate: Date, toDate: Date;
    if (field.startsWith('duration')) {
      fromDate = combineDateTime(draftValues.fromDate, draftValues.fromTime, draftValues.fromAmPm);
      const durationInMs = draftValues.durationDays * DAY_MS + draftValues.durationHours * HOUR_MS + draftValues.durationMinutes * MINUTE_MS;
      toDate = new Date(fromDate.getTime() + durationInMs);
    } else {
      fromDate = combineDateTime(draftValues.fromDate, draftValues.fromTime, draftValues.fromAmPm);
      toDate = combineDateTime(draftValues.toDate, draftValues.toTime, draftValues.toAmPm);
    }

    const { correctedFrom, correctedTo, notification: validationNotification } = applyTimeFrameRules(fromDate, toDate);

    if (validationNotification?.kind === 'error') {
      setNotification(validationNotification);
      return; 
    }

    const finalState = calculateSynchronizedState(correctedFrom, correctedTo);
    setValues(finalState);

    // Show any warning message that was generated during correction.
    if (validationNotification) {
      setNotification(validationNotification);
    }
  }, [values]);

  return (
    <div className={styles.TimeFrameContainer}>
      <div>
        <p>Select the time envelope against which the submission time of each test run will be compared.</p>
        <p>Test runs submitted within this envelope will be shown in the results, subject to other filters being applied.</p>
      </div>
      <TimeFrameFilter values={values} handleValueChange={handleValueChange} />
      {notification && (
        <InlineNotification
          className={styles.notification}
          kind={notification.kind} 
          title={notification.kind === 'error' ? 'Invalid Time Frame' : 'Auto-Correction'}
          subtitle={notification.text}
          hideCloseButton={true}
        />
      )}
    </div>
  );
}