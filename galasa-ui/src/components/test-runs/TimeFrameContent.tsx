/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { useState, useCallback } from 'react';
import TimeFrameFilter from './TimeFrameFilter';
import { addMonths, combineDateTime, extractDateTimeForUI, subtractMonths } from '@/utils/functions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ToastNotification } from '@carbon/react';

// Constants
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MONTHS = 3;

/**
 * Calculates the synchronized state of the time frame based on the provided from and to dates.
 * It extracts the UI parts of the dates, calculates the duration in days, hours, and minutes,
 * and returns a complete TimeFrameValues object.
 */
const calculateSynchronizedState = (fromDate: Date, toDate: Date): TimeFrameValues => {
  const fromUiParts = extractDateTimeForUI(fromDate);
  const toUiParts = extractDateTimeForUI(toDate);

  let difference = toDate.getTime() - fromDate.getTime();
  // Duration cannot be negative.
  if (difference < 0) difference = 0;

  const durationDays = Math.floor(difference / DAY_MS);
  difference %= DAY_MS;
  const durationHours = Math.floor(difference / HOUR_MS);
  difference %= HOUR_MS;
  const durationMinutes = Math.floor(difference / MINUTE_MS);

  return {
    fromDate,
    fromTime: fromUiParts.time,
    fromAmPm: fromUiParts.amPm,
    fromTimeZone: fromUiParts.timezone,
    toDate,
    toTime: toUiParts.time,
    toAmPm: toUiParts.amPm,
    toTimeZone: toUiParts.timezone,
    durationDays,
    durationHours,
    durationMinutes,
  };
};

export default function TimeFrameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * State initializer. Runs once on mount to read URL params or set defaults.
   */
  const initializeState = (): TimeFrameValues => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    // Default to the last 24 hours if no params are present.
    const initialToDate = toParam ? new Date(toParam) : new Date();
    const initialFromDate = fromParam ? new Date(fromParam) : new Date(initialToDate.getTime() - DAY_MS);

    // Let the main synchronization function calculate the full state object.
    return calculateSynchronizedState(initialFromDate, initialToDate);
  };

  const [values, setValues] = useState<TimeFrameValues>(initializeState);
  const [errorText, setErrorText] = useState<string | null>(null);

  /**
    * Handles changes of entire time frame values.
   * This function is called when any part of the time frame changes (from/to dates, times, durations).
   * It recalculates the entire time frame state, validates it, and updates the URL.
   *
   * @param field - The specific field that changed (e.g., 'fromDate', 'toTime', 'durationDays').
   * @param value - The new value for the changed field.
   */
  const handleValueChange = useCallback((field: keyof TimeFrameValues, value: any) => {
    setErrorText(null); // Reset error on any new interaction.

    // 1. Create a draft of the next state with the incoming change.
    const draftValues = { ...values, [field]: value };

    let fromDate: Date;
    let toDate: Date;
    let error: string | null = null;

    // 2. Determine the new `fromDate` and `toDate` based on what changed.
    if (field.startsWith('duration')) {
      // If duration changed, 'From' date is the anchor, so we calculate the 'To' date.
      fromDate = combineDateTime(draftValues.fromDate, draftValues.fromTime, draftValues.fromAmPm, draftValues.fromTimeZone);
      const durationInMs = (draftValues.durationDays * DAY_MS) +
                           (draftValues.durationHours * HOUR_MS) +
                           (draftValues.durationMinutes * MINUTE_MS);
      toDate = new Date(fromDate.getTime() + durationInMs);
    } else {
      // If a 'From' or 'To' field changed, we recalculate both dates from their parts.
      fromDate = combineDateTime(draftValues.fromDate, draftValues.fromTime, draftValues.fromAmPm, draftValues.fromTimeZone);
      toDate = combineDateTime(draftValues.toDate, draftValues.toTime, draftValues.toAmPm, draftValues.toTimeZone);
    }
    
    // 3. Validate and apply business logic to the calculated dates.
    const now = new Date();
    if (toDate > now) {
      toDate = now;
      error = "Date range cannot extend beyond the current time. 'To' date has been adjusted to now.";
    }
    
    if (fromDate > toDate) {
      // If the user sets 'From' after 'To', bring 'From' back to be equal to 'To'.
      fromDate = toDate;
      if (!error) error = "'From' date cannot be after 'To' date. 'From' date has been adjusted.";
    }

    const maxToDate = addMonths(fromDate, MAX_RANGE_MONTHS);
    if (toDate > maxToDate) {
      // If the range is too large, adjust the end date.
      toDate = maxToDate;
      if (!error) error = `Date range cannot exceed ${MAX_RANGE_MONTHS} months. 'To' date has been automatically adjusted.`;
    }

    // 4. Calculate the final, fully synchronized state from the validated dates.
    const finalState = calculateSynchronizedState(fromDate, toDate);

    // 5. Set state and update URL.
    setValues(finalState);
    if (error) setErrorText(error);

    const params = new URLSearchParams(searchParams);
    params.set('from', finalState.fromDate.toISOString());
    params.set('to', finalState.toDate.toISOString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

  }, [values, searchParams, pathname, router]); 

  return (
    <div className={styles.TimeFrameContainer}>
      {errorText && (
        <ToastNotification
          className={styles.ErrorNotification}
          kind="warning"
          title="Auto-Correction"
          subtitle={errorText}
          onClose={() => setErrorText(null)}
          timeout={5000}
        />
      )}
      <div>
        <p>Select the time envelope against which the submission time of each test run will be compared.</p>
        <p>Test runs submitted within this envelope will be shown in the results, subject to other filters being applied.</p>
      </div>
      <TimeFrameFilter values={values} handleValueChange={handleValueChange} />
    </div>
  );
}