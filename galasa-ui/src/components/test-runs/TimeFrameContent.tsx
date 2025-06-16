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

const getYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
}

export default function TimeFrameContent() {
  // State to hold the values for the time frame selection
  const [values, setValues] = useState<TimeFrameValues>({
    fromDate: getYesterday(), // Default to yesterday
    fromTime: '09:00',
    fromAmPm: 'AM',
    fromTimeZone: 'PDT',
    toDate: new Date(),
    toTime: '09:00',
    toAmPm: 'PM',
    toTimeZone: 'GMT',
    durationDays: 1,
    durationHours: 0,
    durationMinutes: 0,
  });

  function handleValueChange(field: keyof TimeFrameValues, value: any) {
    setValues((prevValues) => ({
      ...prevValues,
      [field]: value,
    }));

    console.log('Current values:', values);
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