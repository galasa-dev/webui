/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { from } from '@/generated/galasaapi/rxjsStub';
import styles from '@/styles/TestRunsPage.module.css';
import { parseAndValidateTime } from '@/utils/functions';
import { TimeFrameValues } from '@/utils/interfaces';
import { FormGroup } from '@carbon/react';
import { DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem, NumberInput } from '@carbon/react';
import { useEffect, useState } from 'react';

export default function TimeFrameFilter({
  values,
  handleValueChange,
}: {
  values: TimeFrameValues;
  handleValueChange: (field: keyof TimeFrameValues, value: any) => void;
}) {
  const invalidTimeText = "Please enter a valid time in HH:MM format.";

  // Local state for TimePicker inputs to allow immediate typing before validation on blur
  const [localFromTime, setLocalFromTime] = useState(values.fromTime);
  const [localToTime, setLocalToTime] = useState(values.toTime);

  useEffect(() => {
    setLocalFromTime(values.fromTime);
  }, [values.fromTime]);

  useEffect(() => {
    setLocalToTime(values.toTime);
  }, [values.toTime]);

  const handleTimeBlur = (
    timeValue: string,
    field: 'fromTime' | 'toTime'
  ) => {
    let formattedTime = parseAndValidateTime(timeValue);

    // If the time is invalid, revert to the last valid time from the parent state.
    if (!formattedTime) {
      formattedTime = field === 'fromTime' ? values.fromTime : values.toTime;
      // Visually revert the input field to the last valid time.
      if (field === 'fromTime') {
        setLocalFromTime(formattedTime);
      } else {
        setLocalToTime(formattedTime);
      }
    }

    // Update the parent component's state with the valid, formatted time.
    handleValueChange(field, formattedTime);
  };

  return (
    <div className={styles.TimeFrameFilterContainer}>
      <FormGroup legendText="From" className={styles.TimeFrameFilterItem}>
        <DatePicker
          datePickerType="single"
          value={values.fromDate}
          maxDate={values.toDate}
          onChange={(dates: Date[]) =>
            handleValueChange('fromDate', dates && dates.length > 0 ? dates[0] : null)
          }
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
          invalid={localFromTime !== '' && !parseAndValidateTime(localFromTime)}
          invalidText={invalidTimeText}
          onChange={(event) => setLocalFromTime(event.target.value)}
          onBlur={() => handleTimeBlur(localFromTime, 'fromTime')}
        >
          <TimePickerSelect
            id="from-time-picker-ampm"
            value={values.fromAmPm}
            onChange={(event) => handleValueChange('fromAmPm', event.target.value)}
          >
            <SelectItem text="AM" value="AM" />
            <SelectItem text="PM" value="PM" />
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
            onChange={(_event, { value }) => handleValueChange('durationDays', value)}
          />
          <NumberInput
            id="duration-hours"
            label="Hours"
            min={0}
            max={23}
            value={values.durationHours}
            onChange={(_event, { value }) => handleValueChange('durationHours', value)}
          />
          <NumberInput
            id="duration-minutes"
            label="Minutes"
            min={0}
            max={59}
            value={values.durationMinutes}
            onChange={(_event, { value }) => handleValueChange('durationMinutes', value)}
          />
        </div>
      </FormGroup>
      <FormGroup legendText="To" className={styles.TimeFrameFilterItem}>
        <DatePicker
          datePickerType="single"
          value={values.toDate}
          maxDate={new Date()}
          minDate={values.fromDate}
          onChange={(dates: Date[]) =>
            handleValueChange('toDate', dates && dates.length > 0 ? dates[0] : null)
          }
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
          invalid={localToTime !== '' && !parseAndValidateTime(localToTime)}
          invalidText={invalidTimeText}
          onChange={(event) => setLocalToTime(event.target.value)}
          onBlur={() => handleTimeBlur(localToTime, 'toTime')}
        >
          <TimePickerSelect
            id="to-time-picker-ampm"
            value={values.toAmPm}
            onChange={(event) => handleValueChange('toAmPm', event.target.value)}
          >
            <SelectItem text="AM" value="AM" />
            <SelectItem text="PM" value="PM" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
    </div>
  );
}