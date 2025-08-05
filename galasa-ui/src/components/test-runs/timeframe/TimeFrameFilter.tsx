/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/TimeFrameContent.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import DateTimePicker from './DateTimePicker';
import { useTranslations } from 'next-intl';

export default function TimeFrameFilter({
  values,
  handleValueChange,
  disabled = false,
}: {
  values: TimeFrameValues;
  handleValueChange: (field: keyof TimeFrameValues, value: any) => void;
  disabled?: boolean;
}) {
  const translations = useTranslations('TimeFrameFilter');
  return (
    <div className={styles.timeFrameFilterContainer}>
      <DateTimePicker
        legend={translations('from')}
        date={values.fromDate}
        time={values.fromTime}
        amPm={values.fromAmPm}
        onDateChange={(date) => handleValueChange('fromDate', date)}
        onTimeChange={(time) => handleValueChange('fromTime', time)}
        onAmPmChange={(amPm) => handleValueChange('fromAmPm', amPm)}
        disabled={disabled}
      />
      <DateTimePicker
        legend={translations('to')}
        date={values.toDate}
        time={values.toTime}
        amPm={values.toAmPm}
        onDateChange={(date) => handleValueChange('toDate', date)}
        onTimeChange={(time) => handleValueChange('toTime', time)}
        onAmPmChange={(amPm) => handleValueChange('toAmPm', amPm)}
        disabled={disabled}
      />
    </div>
  );
}
