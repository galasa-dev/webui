
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import {FormGroup } from '@carbon/react';
import { DatePicker, DatePickerInput, TimePicker, TimePickerSelect, SelectItem , NumberInput} from '@carbon/react';

export default function TimeFrameFilter({values, handleValueChange}: {values: TimeFrameValues, handleValueChange: (field: keyof TimeFrameValues, value: any) => void}) {
  const timePattern = '(d{1,2}:d{2})';
  return (
    <div className={styles.TimeFrameFilterContainer}>
      <FormGroup legendText="From" className={styles.TimeFrameFilterItem}>
        <DatePicker 
          datePickerType="single" 
          value={values.fromDate}
          onChange={(dates: Date[]) => handleValueChange('fromDate', dates[0])}
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
          value={values.fromTime}
          pattern={timePattern}
          onChange={(event:any) => handleValueChange('fromTime', event.target.value)}
        >
          <TimePickerSelect id="from-time-picker-ampm"
            value={values.fromAmPm}
            onChange={(event:any) => handleValueChange('fromAmPm', event.target.value)}
          >
            <SelectItem text="AM" value="AM"/>
            <SelectItem text="PM" value="PM"/>
          </TimePickerSelect>
          <TimePickerSelect 
            id="from-time-picker-timezone"
            value={values.fromTimeZone}
            onChange={(event:any) => handleValueChange('fromTimeZone', event.target.value)}
          >
            <SelectItem text="PDT" value="PDT" />
            <SelectItem text="GMT" value="GMT" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
      <FormGroup legendText="Duration" className={styles.TimeFrameFilterItem}>
        <div className={styles.DurationInputsContainer}>
          <NumberInput 
            id="duration-days" 
            label='Days' 
            min={0} 
            max={365}
            value={values.durationDays}
            onChange={(_event:any, {value} : {value: number}) => handleValueChange('durationDays', value)}/>
          <NumberInput 
            id="duration-hours" 
            label='Hours' 
            min={0} 
            max={23}
            value={values.durationHours}
            onChange={(_event:any, {value} : {value: number}) => handleValueChange('durationHours', value)}/>
          <NumberInput 
            id="duration-minutes" 
            label='Minutes' 
            min={0}
            max={59} 
            value={values.durationMinutes}
            onChange={(_event:any, {value} : {value: number}) => handleValueChange('durationMinutes', value)}/>
        </div>
      </FormGroup>
      <FormGroup legendText="To" className={styles.TimeFrameFilterItem}>
        <DatePicker
          datePickerType="single" 
          value={values.toDate}
          onChange={(dates: Date[]) => handleValueChange('toDate', dates[0])}
        >
          <DatePickerInput
            id="date-picker-single"
            labelText="Date"
            placeholder="mm/dd/yyyy"
          />
        </DatePicker>
        <TimePicker
          id="to-time-picker"
          labelText="Time"
          value={values.toTime}
          pattern={timePattern}
          onChange={(event:any) => handleValueChange('toTime', event.target.value)}
        >
          <TimePickerSelect id="to-time-picker-ampm"
            value={values.toAmPm}
            onChange={(event:any) => handleValueChange('toAmPm', event.target.value)}
          >
            <SelectItem text="AM" value="AM"/>
            <SelectItem text="PM" value="PM"/>
          </TimePickerSelect>
          <TimePickerSelect 
            id="to-time-picker-timezone"
            value={values.toTimeZone}
            onChange={(event:any) => handleValueChange('toTimeZone', event.target.value)}
          >
            <SelectItem text="PDT" value="PDT" />
            <SelectItem text="GMT" value="GMT" />
          </TimePickerSelect>
        </TimePicker>
      </FormGroup>
    </div>
  );
}