/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { FormGroup } from '@carbon/react';
import { DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem, NumberInput } from '@carbon/react';
import { useState } from 'react';

export default function TimeFrameFilter({
  values,
  handleValueChange,
}: {
  values: TimeFrameValues;
  handleValueChange: (field: keyof TimeFrameValues, value: any) => void;
}) {
  const invalidTimeText = "Please enter a valid time in HH:MM format.";

  // Local state for TimePicker inputs to allow immediate typing
  const [localFromTime, setLocalFromTime] = useState(values.fromTime);
  const [localToTime, setLocalToTime] = useState(values.toTime);

  // Helper function to validate time format
  const isValidTimeFormat = (timeValue: string): boolean => {
    if (!timeValue) return false;
    const timeParts = timeValue.split(':');
    if (timeParts.length !== 2) return false;

    const [hours, minutes] = timeParts;
    const hoursNum = Number(hours);
    const minutesNum = Number(minutes);

    return (
      !isNaN(hoursNum) &&
      !isNaN(minutesNum) &&
      hoursNum >= 0 &&
      hoursNum <= 23 &&
      minutesNum >= 0 &&
      minutesNum <= 59
    );
  };

  // Helper function to format time on blur
  const formatTime = (timeValue: string): string => {
    if (isValidTimeFormat(timeValue)) return timeValue;
    return "00:00"; // Default to a valid time if invalid
  };

  // Handle TimePicker change with logging
  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: 'fromTime' | 'toTime',
    setLocalTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const newValue = event.target.value;
    console.log(`TimePicker ${field} changed to: ${newValue}`);
    setLocalTime(newValue);
  };

  // Handle TimePicker blur to sync with parent state
  const handleTimeBlur = (
    timeValue: string,
    field: 'fromTime' | 'toTime',
    setLocalTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    console.log(`TimePicker ${field} blurred with value: ${timeValue}`);
    const formattedTime = formatTime(timeValue);
    if (formattedTime !== timeValue) {
      setLocalTime(formattedTime);
    }
    handleValueChange(field, formattedTime);
  };

  return (
    <div className={styles.TimeFrameFilterContainer}>
      <FormGroup legendText="From" className={styles.TimeFrameFilterItem}>
        <DatePicker
          datePickerType="single"
          value={values.fromDate}
          maxDate={values.toDate}
          onChange={(dates: Date[]) => {
            console.log('From Date changed to:', dates[0]);
            handleValueChange('fromDate', dates[0]);
          }}
        >
          <DatePickerInput
            id="from-date-picker"
            labelText="Date"
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
        <TimePicker
          id="from-time-picker"
          labelText="Time"
          value={localFromTime}
          invalid={localFromTime !== '' && !isValidTimeFormat(localFromTime)}
          invalidText={invalidTimeText}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleTimeChange(event, 'fromTime', setLocalFromTime)
          }
          onBlur={() => handleTimeBlur(localFromTime, 'fromTime', setLocalFromTime)}
          readOnly={false}
          disabled={false}
        >
          <TimePickerSelect
            id="from-time-picker-ampm"
            value={values.fromAmPm}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              console.log('From AM/PM changed to:', event.target.value);
              handleValueChange('fromAmPm', event.target.value);
            }}
          >
            <SelectItem text="AM" value="AM" />
            <SelectItem text="PM" value="PM" />
          </TimePickerSelect>
          <TimePickerSelect
            id="from-time-picker-timezone"
            value={values.fromTimeZone}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              console.log('From TimeZone changed to:', event.target.value);
              handleValueChange('fromTimeZone', event.target.value);
            }}
          >
            <SelectItem text="PDT" value="PDT" />
            <SelectItem text="GMT" value="GMT" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
      <FormGroup legendText="Duration" className={styles.TimeFrameFilterItem}>
        <div className={styles.DurationInputsContainer} key={values.toDate.getTime()}>
          <NumberInput
            id="duration-days"
            label="Days"
            min={0}
            max={355}
            value={values.durationDays}
            onChange={(_event: any, { value }: { value: number }) => {
              console.log('Duration Days changed to:', value);
              handleValueChange('durationDays', value);
            }}
          />
          <NumberInput
            id="duration-hours"
            label="Hours"
            min={0}
            max={23}
            value={values.durationHours}
            onChange={(_event: any, { value }: { value: number }) => {
              console.log('Duration Hours changed to:', value);
              handleValueChange('durationHours', value);
            }}
          />
          <NumberInput
            id="duration-minutes"
            label="Minutes"
            min={0}
            max={59}
            value={values.durationMinutes}
            onChange={(_event: any, { value }: { value: number }) => {
              console.log('Duration Minutes changed to:', value);
              handleValueChange('durationMinutes', value);
            }}
          />
        </div>
      </FormGroup>
      <FormGroup legendText="To" className={styles.TimeFrameFilterItem}>
        <DatePicker
          datePickerType="single"
          value={values.toDate}
          maxDate={new Date()}
          minDate={values.fromDate}
          onChange={(dates: Date[]) => {
            console.log('To Date changed to:', dates[0]);
            handleValueChange('toDate', dates[0]);
          }}
        >
          <DatePickerInput
            id="to-date-picker"
            labelText="Date"
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
        <TimePicker
          id="to-time-picker"
          labelText="Time"
          value={localToTime}
          invalid={localToTime !== '' && !isValidTimeFormat(localToTime)}
          invalidText={invalidTimeText}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            handleTimeChange(event, 'toTime', setLocalToTime)
          }
          onBlur={() => handleTimeBlur(localToTime, 'toTime', setLocalToTime)}
          readOnly={false}
          disabled={false}
        >
          <TimePickerSelect
            id="to-time-picker-ampm"
            value={values.toAmPm}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              console.log('To AM/PM changed to:', event.target.value);
              handleValueChange('toAmPm', event.target.value);
            }}
          >
            <SelectItem text="AM" value="AM" />
            <SelectItem text="PM" value="PM" />
          </TimePickerSelect>
          <TimePickerSelect
            id="to-time-picker-timezone"
            value={values.toTimeZone}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
              console.log('To TimeZone changed to:', event.target.value);
              handleValueChange('toTimeZone', event.target.value);
            }}
          >
            <SelectItem text="PDT" value="PDT" />
            <SelectItem text="GMT" value="GMT" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
    </div>
  );
}