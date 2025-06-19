/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { useState } from 'react';
import TimeFrameFilter from './TimeFrameFilter';
import { addMonths, combineDateTime, extractDateTimeForUI, subtractMonths } from '@/utils/functions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ToastNotification } from '@carbon/react';

// Milliseconds constants for cleaner calculations
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_MONTHS_DIFFERENCE = 3; 

export default function TimeFrameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * State initializer function. This runs only once when the component is mounted.
   * It reads the URL search params to set the initial states
   * or falls back to default values if not present.
   */
  const initializeState = (): TimeFrameValues => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const toDate = toParam ? new Date(toParam) : new Date();
    const fromDate = fromParam ? new Date(fromParam) : new Date(toDate.getTime() - DAY_MS);

    const fromUiParts = extractDateTimeForUI(fromDate);
    const toUiParts = extractDateTimeForUI(toDate);

    // Calculate duration 
    let difference = toDate.getTime() - fromDate.getTime();
    const durationDays = Math.floor(difference / DAY_MS);
    difference %= DAY_MS;
    const durationHours = Math.floor(difference / HOUR_MS);
    difference %= HOUR_MS;
    const durationMinutes = Math.floor(difference / MINUTE_MS);

    // Update the URL if 'from' or 'to' are not set
    if (!fromParam || !toParam) {
      const params = new URLSearchParams(searchParams);
      if (!fromParam) {
        params.set('from', fromDate.toISOString());
      }
      if (!toParam) {
        params.set('to', toDate.toISOString());
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }

    return {
      fromDate: fromDate,
      fromTime: fromUiParts.time,
      fromAmPm: fromUiParts.amPm,
      fromTimeZone: fromUiParts.timezone,
      toDate: toDate,
      toTime: toUiParts.time,
      toAmPm: toUiParts.amPm,
      toTimeZone: toUiParts.timezone,
      durationDays: durationDays,
      durationHours: durationHours,
      durationMinutes: durationMinutes,
    };
  };

  // State to hold the values for the time frame selection
  const [values, setValues] = useState<TimeFrameValues>(initializeState);
  const [errorText, setErrorText] = useState<string | null>(null);

  /**
   * Validates the date range and synchronizes the state.
   * This function checks if the 'From' and 'To' dates are within the allowed range,
   * adjusts them if necessary, and updates the state accordingly.
   * 
   * @param from - The 'From' date
   * @param to - The 'To' date
   * @param field - The field that triggered the change (either 'from' or 'to')
   * @param currentValues - The current values of the time frame
   * @returns An object containing the updated values, any error message, and the final 'From' and 'To' dates.
   */
  const applyValidationAndSyncState = (
    from: Date,
    to: Date,
    field: keyof TimeFrameValues,
    currentValues: TimeFrameValues
  )  => {
    let error: string | null = null;
    let finalFrom = new Date(from);
    let finalTo = new Date(to);

    // Enforce the 3-months maximum rule
    const maxToDate = addMonths(finalFrom, MAX_MONTHS_DIFFERENCE);
    if (finalTo > maxToDate) {
      error =  `Date range cannot exceed ${MAX_MONTHS_DIFFERENCE} months. A date has been automatically adjusted.`;
      if (field.startsWith('to')) {
        finalFrom = subtractMonths(finalTo, MAX_MONTHS_DIFFERENCE);
      }
      else {
        finalTo = maxToDate;
      }
    }

    // Check if the 'To' date is in the future
    const now = new Date();
    if (finalTo > now) {
      if (!error) {
        error = "Date range cannot extend beyond the current time. Adjusting to now.";
      }
      finalTo = now;
    }

    // Synchronize the values with the final dates (after validation) rendered for the UI
    const syncedValues = {...currentValues };
    const fromUiParts = extractDateTimeForUI(finalFrom);
    syncedValues.fromDate = finalFrom;
    syncedValues.fromTime = fromUiParts.time;
    syncedValues.fromAmPm = fromUiParts.amPm;
    syncedValues.fromTimeZone = fromUiParts.timezone;

    const toUiParts = extractDateTimeForUI(finalTo);
    syncedValues.toDate = finalTo;
    syncedValues.toTime = toUiParts.time;
    syncedValues.toAmPm = toUiParts.amPm;
    syncedValues.toTimeZone = toUiParts.timezone;

    let durationDifference = finalTo.getTime() - finalFrom.getTime();
    syncedValues.durationDays = Math.floor(durationDifference / DAY_MS);
    durationDifference %= DAY_MS;
    syncedValues.durationHours = Math.floor(durationDifference / HOUR_MS);
    durationDifference %= HOUR_MS;
    syncedValues.durationMinutes = Math.floor(durationDifference / MINUTE_MS);

    return {values: syncedValues, error, finalFrom, finalTo};
  }

  /**
   * Update the final state and URL based on the validation result.
   * 
   * @param result - The result of the validation and synchronization process.
   */
  const updateUrl = (fromDate: Date, toDate: Date) => {
    const params = new URLSearchParams(searchParams);
    params.set('from', fromDate.toISOString());
    params.set('to', toDate.toISOString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  /**
   * Handles changes to date or time fields.
   */
  const handleDateChange = (newValues: TimeFrameValues, field: keyof TimeFrameValues) :  ReturnType<typeof applyValidationAndSyncState> => {
    const fromDateTime = combineDateTime(
      newValues.fromDate, newValues.fromTime, newValues.fromAmPm, newValues.fromTimeZone
    );
    const toDateTime = combineDateTime(
      newValues.toDate, newValues.toTime, newValues.toAmPm, newValues.toTimeZone
    );
    return applyValidationAndSyncState(fromDateTime, toDateTime, field, newValues);
  };
  
  /**
   * Handles changes to duration fields (days, hours, minutes).
   */
  const handleDurationChange = (newValues: TimeFrameValues, field: keyof TimeFrameValues): ReturnType<typeof applyValidationAndSyncState> =>  {
    const fromDateTime = combineDateTime(
      newValues.fromDate, newValues.fromTime, newValues.fromAmPm, newValues.fromTimeZone
    );
    const durationInMs = (newValues.durationDays * DAY_MS) +
      (newValues.durationHours * HOUR_MS) +
      (newValues.durationMinutes * MINUTE_MS);
    const toDateTime = new Date(fromDateTime.getTime() + durationInMs);
    return applyValidationAndSyncState(fromDateTime, toDateTime, field, newValues);
  };



  function handleValueChange(field: keyof TimeFrameValues, value: any) {
    setErrorText(null); // Reset error text on any change

    const newValues = {...values, [field]: value};

    setValues(newValues);
    console.log("New values:", newValues);
   let result: ReturnType<typeof applyValidationAndSyncState>;

    if (field.startsWith('duration')) {
      result = handleDurationChange(newValues, field);
    } else {
      result = handleDateChange(newValues, field);
    }


    setValues(result.values);
    setErrorText(result.error);
    updateUrl(result.finalFrom, result.finalTo);
  }

  
  return (
    <div className={styles.TimeFrameContainer}>
      {errorText && <ToastNotification 
      className={styles.ErrorNotification}
      kind="warning"
      title="Auto-Correction"
      subtitle={errorText}
      onClose={() => setErrorText(null)}
      timeout={5000}
       />}
      <div>
        <p>Select the time envelope against which the submission time of each test run will be compared.</p>
        <p>Test runs submitted within this envelope will be shown in the results, subject to other filters being applied.</p>
      </div>
      <TimeFrameFilter values={values} handleValueChange={handleValueChange} />
    </div>
  );
}