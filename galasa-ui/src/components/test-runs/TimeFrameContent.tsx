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
import { combineDateTime, extractDateTimeForUI, getYesterday } from '@/utils/functions';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Milliseconds constants for cleaner calculations
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export default function TimeFrameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * State initializer function. This runs only once when the component is mounted.
   * It reads the URL search params to set the initial stater
   * or falls back to default values if not present.
   */
  const initializeState = (): TimeFrameValues => {
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const fromUiParts = fromParam ? extractDateTimeForUI(new Date(fromParam)) : {
      time: '09:00',
      amPm: 'AM' as 'AM' | 'PM',
      timezone: 'PDT'
    };

    const toUiParts = toParam ? extractDateTimeForUI(new Date(toParam)) : {
      time: '09:00',
      amPm: 'PM' as 'AM' | 'PM',
      timezone: 'GMT' 
    };

    // Calculate duration
    let difference = toParam ? new Date(toParam).getTime() - (fromParam ? new Date(fromParam).getTime() : getYesterday().getTime()) : 0;
    const durationDays = Math.floor(difference / DAY_MS);
    difference %= DAY_MS;
    const durationHours = Math.floor(difference / HOUR_MS);
    difference %= HOUR_MS;
    const durationMinutes = Math.floor(difference / MINUTE_MS);

    return {
      fromDate: fromParam ? new Date(fromParam) : getYesterday(),
      fromTime: fromUiParts.time,
      fromAmPm: fromUiParts.amPm,
      fromTimeZone: fromUiParts.timezone,
      toDate: toParam ? new Date(toParam) : new Date(),
      toTime: toUiParts.time,
      toAmPm: toUiParts.amPm,
      toTimeZone: toUiParts.timezone,
      durationDays: durationDays,
      durationHours: durationHours,
      durationMinutes: durationMinutes,
    };
  };

  const [values, setValues] = useState<TimeFrameValues>(initializeState);

  // State to hold the values for the time frame selection
  function handleValueChange(field: keyof TimeFrameValues, value: any) {
    // Check validity of the time input 
    if (field === 'fromTime' || field === 'toTime') {
      const timeParts = value.split(':');
      console.log("Time parts:", timeParts);
      if (timeParts.length !== 2 || isNaN(Number(timeParts[0])) || isNaN(Number(timeParts[1]))) {
        console.log("Invalid time format. Please use HH:MM format.");
        return; 
      }
      
      // Ensure the time is in valid range
      const hours = Number(timeParts[0]);
      const minutes = Number(timeParts[1]);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return; 
      }
    }

    // Create a new values object with the updated field
    let newValues: TimeFrameValues = { ...values, [field]: value };
    
    const fromDateTime = combineDateTime(
      newValues.fromDate,
      newValues.fromTime,
      newValues.fromAmPm,
      newValues.fromTimeZone
    );

    const toDateTime = combineDateTime(
      newValues.toDate,
      newValues.toTime,
      newValues.toAmPm,
      newValues.toTimeZone
    );
    
    if (field.startsWith('duration')) {
      // Anchor is 'Duration'. Recalculate 'To'
      const durationInMs = (newValues.durationDays * DAY_MS) +
      (newValues.durationHours * HOUR_MS) +
      (newValues.durationMinutes * MINUTE_MS);

      const newToDate = new Date(fromDateTime.getTime() + durationInMs);

      const toUiParts = extractDateTimeForUI(newToDate);
      newValues.toDate = newToDate;
      newValues.toTime = toUiParts.time;
      newValues.toAmPm = toUiParts.amPm;
    } else {
      // Anchor is 'From' or 'To', Recalculate 'Duration'
      let difference = toDateTime.getTime() - fromDateTime.getTime();
      if(difference < 0) difference = 0; // Ensure non-negative duration

      newValues.durationDays = Math.floor(difference / DAY_MS);
      difference %= DAY_MS;
      newValues.durationHours = Math.floor(difference / HOUR_MS);
      difference %= HOUR_MS;
      newValues.durationMinutes = Math.floor(difference / MINUTE_MS);
      
    }

    setValues(newValues);

    console.log("Updated values:", newValues);

    // Set the SearchParams in the URL
    const params = new URLSearchParams(searchParams);
    params.set('from', fromDateTime.toISOString());
    params.set('to', toDateTime.toISOString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  
  return (
    <div className={styles.TimeFrameContainer}>
      <div>
        <p>Select the time envelope against which the submission time of each test run will be compared.</p>
        <p>Test runs submitted within this envelope will be shown in the results, subject to other filters being applied.</p>
      </div>
      <TimeFrameFilter values={values} handleValueChange={handleValueChange} />
     
    </div>
  );
}