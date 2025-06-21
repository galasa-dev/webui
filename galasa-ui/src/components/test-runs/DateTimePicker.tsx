/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/TestRunsPage.module.css';
import { parseAndValidateTime } from '@/utils/functions';
import { FormGroup, DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem } from '@carbon/react';
import { useState, useEffect } from 'react';

interface DateTimePickerProps {
  legend: string;
  date: Date;
  time: string;
  amPm: string;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  onAmPmChange: (amPm: string) => void;
}

/**
 * A self-contained component for selecting a date and time.
 */
export default function DateTimePicker({
  legend,
  date,
  time,
  amPm,
  onDateChange,
  onTimeChange,
  onAmPmChange,
}: DateTimePickerProps) {
  const [localTime, setLocalTime] = useState(time);
  const invalidTimeText = 'Please enter a valid time in HH:MM format.';

  // Sync local state if the time prop changes from the parent
  useEffect(() => {
    setLocalTime(time);
    console.log(`Time prop updated: ${time}`);
  }, [time]);

  const handleTimeBlur = () => {
    const formattedTime = parseAndValidateTime(localTime);
    if (formattedTime) {
      onTimeChange(formattedTime); 
    } else {
      setLocalTime(time); // Revert to last known valid time
    }
  };

  return (
    <FormGroup legendText={legend} className={styles.TimeFrameFilterItem}>
      <DatePicker
        datePickerType="single"
        value={date}
        maxDate={new Date()}
        onChange={(dates: Date[]) => onDateChange(dates?.[0] || null)}
      >
        <DatePickerInput id={`${legend}-date-picker`} labelText="Date" placeholder="mm/dd/yyyy" />
      </DatePicker>
      <TimePicker
        id={`${legend}-time-picker`}
        labelText="Time"
        value={localTime}
        invalid={!parseAndValidateTime(localTime)}
        invalidText={invalidTimeText}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLocalTime(event.target.value)}
        onBlur={handleTimeBlur}
      >
        <TimePickerSelect
          id={`${legend}-time-picker-ampm`}
          value={amPm}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onAmPmChange(event.target.value)}
        >
          <SelectItem text="AM" value="AM" />
          <SelectItem text="PM" value="PM" />
        </TimePickerSelect>
      </TimePicker>
    </FormGroup>
  );
}