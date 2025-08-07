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
import { FromSelectionOptions, fromToSelectionEnum } from './TimeFrameContent';

export default function TimeFrameFilter({
  values,
  handleValueChange,
  fromToSelection,
  disabled = false,
}: {
  values: TimeFrameValues;
  handleValueChange: (field: keyof TimeFrameValues, value: any) => void;
  fromToSelection: fromToSelectionEnum;
  disabled?: boolean;
}) {
  const translations = useTranslations('TimeFrameFilter');
  return (
    <div className={styles.timeFrameFilterContainer}>
      <DateTimePicker
        legend={
          fromToSelection === fromToSelectionEnum.FromSelectionOptions
            ? translations('from')
            : translations('to')
        }
        date={values.fromDate}
        time={values.fromTime}
        amPm={values.fromAmPm}
        onDateChange={(date) =>
          handleValueChange(
            fromToSelection === fromToSelectionEnum.FromSelectionOptions ? 'fromDate' : 'toDate',
            date
          )
        }
        onTimeChange={(time) =>
          handleValueChange(
            fromToSelection === fromToSelectionEnum.FromSelectionOptions ? 'fromTime' : 'toTime',
            time
          )
        }
        onAmPmChange={(amPm) =>
          handleValueChange(
            fromToSelection === fromToSelectionEnum.FromSelectionOptions ? 'fromAmPm' : 'toAmPm',
            amPm
          )
        }
        disabled={disabled}
      />
    </div>
  );
}
