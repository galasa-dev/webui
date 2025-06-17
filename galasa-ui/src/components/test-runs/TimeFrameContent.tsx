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
    const durationDays = Math.floor(difference / (1000 * 60 * 60 * 24));
    difference -= durationDays * (1000 * 60 * 60 * 24);
    const durationHours = Math.floor(difference / (1000 * 60 * 60));
    difference -= durationHours * (1000 * 60 * 60);
    const durationMinutes = Math.floor(difference / (1000 * 60));

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
    }
  }

  const [values, setValues] = useState<TimeFrameValues>(initializeState);

  // State to hold the values for the time frame selection
  function handleValueChange(field: keyof TimeFrameValues, value: any) {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));

    console.log('Current values:', values);

    // TODO: Logic to handle the duration - right now we just get the intervals from the date and time fields.

    // Combine the date and time values into a single Date object
    const fromDateTime = combineDateTime(
      values.fromDate,
      values.fromTime,
      values.fromAmPm,
      values.fromTimeZone
    );

    const toDateTime = combineDateTime(
      values.toDate,
      values.toTime,
      values.toAmPm,
      values.toTimeZone
    );

    // Ensure the 'from' date is before the 'to' date
    if (fromDateTime >= toDateTime) {
      console.error('From date must be before To date');
      return;
    }

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