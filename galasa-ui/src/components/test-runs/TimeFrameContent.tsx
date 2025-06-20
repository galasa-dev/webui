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
import { addMonths, combineDateTime, extractDateTimeForUI } from '@/utils/functions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { InlineNotification } from '@carbon/react';

// Constants
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MONTHS = 3;

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
function applyTimeFrameRules(fromDate: Date, toDate: Date): { correctedFrom: Date; correctedTo: Date; notification: Notification | null } {
  let correctedFrom = new Date(fromDate.getTime());
  let correctedTo = new Date(toDate.getTime());
  let notification: Notification | null = null;

  const now = new Date();
  if (correctedTo > now) {
    correctedTo = now;
    notification = {
      text: "Date range was capped at the current time.",
      kind: 'warning',
    };
  }
  
  const maxToDate = addMonths(correctedFrom, MAX_RANGE_MONTHS);
  if (correctedTo > maxToDate) {
    correctedTo = maxToDate;
    notification = {
      text: `Date range cannot exceed ${MAX_RANGE_MONTHS} months; 'To' date has been adjusted.`,
      kind: 'warning',
    };
  }

  if (correctedFrom > correctedTo) {
    return { 
      correctedFrom: fromDate, // Return original dates
      correctedTo: toDate, 
      notification: {
        text: "'To' date cannot be before 'From' date.",
        kind: 'error',
      }
    };
  }

  return { correctedFrom, correctedTo, notification };
}

/**
 * Calculates the final, fully synchronized state object from two valid dates.
 */
const calculateSynchronizedState = (fromDate: Date, toDate: Date): TimeFrameValues => {
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
          className={styles.ErrorNotification}
          kind={notification.kind} 
          title={notification.kind === 'error' ? 'Invalid Time Frame' : 'Auto-Correction'}
          subtitle={notification.text}
          hideCloseButton={true}
        />
      )}
    </div>
  );
}