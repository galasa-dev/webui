/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/TestRunsPage.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { FormGroup, NumberInput } from '@carbon/react';
import DateTimePicker from './DateTimePicker'; 

const MAX_DAYS = 90;
const MAX_HOURS = 23;
const MAX_MINUTES = 59;

export default function TimeFrameFilter({
  values,
  handleValueChange,
}: {
  values: TimeFrameValues;
  handleValueChange: (field: keyof TimeFrameValues, value: any) => void;
}) {
  return (
    <div className={styles.TimeFrameFilterContainer}>
      <DateTimePicker
        legend="From"
        date={values.fromDate}
        time={values.fromTime}
        amPm={values.fromAmPm}
        onDateChange={(date) => handleValueChange('fromDate', date)}
        onTimeChange={(time) => handleValueChange('fromTime', time)}
        onAmPmChange={(amPm) => handleValueChange('fromAmPm', amPm)}
      />

      <FormGroup legendText="Duration" className={styles.TimeFrameFilterItem} >
        <div className={styles.DurationInputsContainer} key={values.toDate?.getTime() || 0}>
          <NumberInput id="duration-days" label="Days" min={0} max={MAX_DAYS} value={values.durationDays} onChange={(_:React.ChangeEvent<HTMLInputElement>, { value }: {value: number | string}) => handleValueChange('durationDays', value)} />
          <NumberInput id="duration-hours" label="Hours" min={0} max={MAX_HOURS} value={values.durationHours} onChange={(_:React.ChangeEvent<HTMLInputElement>, { value }: {value: number | string}) => handleValueChange('durationHours', value)} />
          <NumberInput id="duration-minutes" label="Minutes" min={0} max={MAX_MINUTES} value={values.durationMinutes} onChange={(_:React.ChangeEvent<HTMLInputElement>, { value }: {value: number | string}) => handleValueChange('durationMinutes', value)} />
        </div>
      </FormGroup>

      <DateTimePicker
        legend="To"
        date={values.toDate}
        time={values.toTime}
        amPm={values.toAmPm}
        onDateChange={(date) => handleValueChange('toDate', date)}
        onTimeChange={(time) => handleValueChange('toTime', time)}
        onAmPmChange={(amPm) => handleValueChange('toAmPm', amPm)}
      />
    </div>
  );
}