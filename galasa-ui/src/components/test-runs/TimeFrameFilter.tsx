/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
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

  // Local state for TimePicker inputs to allow immediate typing
  const [localFromTime, setLocalFromTime] = useState(values.fromTime);
  const [localToTime, setLocalToTime] = useState(values.toTime);

  // Sync local time state with parent values on mount and when toTime changes
  useEffect(() => {
    setLocalFromTime(values.fromTime);
  }, [values.toTime]);

  useEffect(() => {
    setLocalToTime(values.toTime);
  }, [values.toTime]);
  

  // Handle TimePicker change
  const handleTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setLocalTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    const newValue = event.target.value;
    setLocalTime(newValue);
  };

  // Handle TimePicker blur to sync with parent state
  const handleTimeBlur = (
    timeValue: string,
    field: 'fromTime' | 'toTime',
    setLocalTime: React.Dispatch<React.SetStateAction<string>>
  ) => {
    // Validate and format the time input
    let formattedTime = parseAndValidateTime(timeValue);

    // If the time is invalid, set to the last valid time
    if (!formattedTime) {
      formattedTime = field === 'fromTime' ? values.fromTime : values.toTime;
      setLocalTime(formattedTime);
    }

    handleTimeChange(
      { target: { value: formattedTime } } as React.ChangeEvent<HTMLInputElement>,
      field,
      setLocalTime
    );
    console.log(`Time blurred for ${field}:`, formattedTime);
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
            handleValueChange('fromDate', dates[0])
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
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleValueChange('fromAmPm', event.target.value)
            }
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
            onChange={(_event: any, { value }: { value: number }) => 
              handleValueChange('durationDays', value)
            }
          />
          <NumberInput
            id="duration-hours"
            label="Hours"
            min={0}
            max={23}
            value={values.durationHours}
            onChange={(_event: any, { value }: { value: number }) => 
              handleValueChange('durationHours', value)
          }
          />
          <NumberInput
            id="duration-minutes"
            label="Minutes"
            min={0}
            max={59}
            value={values.durationMinutes}
            onChange={(_event: any, { value }: { value: number }) => 
              handleValueChange('durationMinutes', value)
            }
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
            handleValueChange('toDate', dates[0])
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
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => 
              handleValueChange('toAmPm', event.target.value)
            }
          >
            <SelectItem text="AM" value="AM" />
            <SelectItem text="PM" value="PM" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
    </div>
  );
}