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
   * It reads the URL search params to set the initial states
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

  // State to hold the values for the time frame selection
  const [values, setValues] = useState<TimeFrameValues>(initializeState);

  function handleValueChange(field: keyof TimeFrameValues, value: any) {
    // Check validity of the time input 
    if (field === 'fromTime' || field === 'toTime') {
      const timeParts = value.split(':');
      if (timeParts.length !== 2 || isNaN(Number(timeParts[0])) || isNaN(Number(timeParts[1])))  return; 
      
      // Ensure the time is in valid range
      const hours = Number(timeParts[0]);
      const minutes = Number(timeParts[1]);
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return; 
    }

    // Create a new values object with the updated field
    let newValues: TimeFrameValues = { ...values, [field]: value };
    
    // Establish the 'From' anchor point
    const fromDateTime = combineDateTime(
      newValues.fromDate,
      newValues.fromTime,
      newValues.fromAmPm,
      newValues.fromTimeZone
    );

    let finalToDateTime: Date;
    const now = new Date();
    
    // Establish the 'To' anchor point based on the field being updated
    if (field.startsWith('duration')) {
      // Anchor is 'Duration'. Recalculate 'To' date
      const durationInMs = (newValues.durationDays * DAY_MS) +
      (newValues.durationHours * HOUR_MS) +
      (newValues.durationMinutes * MINUTE_MS);

      let proposedToDate = new Date(fromDateTime.getTime() + durationInMs);

       // If proposedToDate is in the future, use now
      finalToDateTime = proposedToDate > now ? now : proposedToDate;

    } else {
      // Anchor is 'From' or 'To'
      finalToDateTime = combineDateTime(
        newValues.toDate,
        newValues.toTime,
        newValues.toAmPm,
        newValues.toTimeZone
      );     
    }

    // Re-synchronize the entire UI to be consistent with the final dates

    // Update the 'To' date and time
    const toUiParts = extractDateTimeForUI(finalToDateTime);
    newValues.toDate = finalToDateTime;
    newValues.toTime = toUiParts.time;
    newValues.toAmPm = toUiParts.amPm;
    newValues.toTimeZone = toUiParts.timezone;

    // Recalculate the duration based on the final 'From' and 'To' dates
    console.log('Final To DateTime:', finalToDateTime);
    let durationDifference = finalToDateTime.getTime() - fromDateTime.getTime();

    console.log('Duration Days:', Math.floor(durationDifference / DAY_MS));
    console.log('Duration Hours:', Math.floor((durationDifference % DAY_MS) / HOUR_MS));
    console.log('Duration Minutes:', Math.floor((durationDifference % HOUR_MS) / MINUTE_MS));

    newValues.durationDays = Math.floor(durationDifference / DAY_MS);
    durationDifference %= DAY_MS;
    newValues.durationHours = Math.floor(durationDifference / HOUR_MS);
    durationDifference %= HOUR_MS;
    newValues.durationMinutes = Math.floor(durationDifference / MINUTE_MS);

    console.log('New values days:', newValues.durationDays);
    console.log('New values hours:', newValues.durationHours);
    console.log('New values minutes:', newValues.durationMinutes);

    // Set the fully consistent state and update the URL
    setValues(newValues);
    
    // Set the SearchParams in the URL
    const params = new URLSearchParams(searchParams);
    params.set('from', fromDateTime.toISOString());
    params.set('to', finalToDateTime.toISOString());
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