/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/test-runs/timeframe/TimeFrameSelector.module.css';
import { TimeFrameValues } from '@/utils/interfaces';
import { useState, useCallback } from 'react';
import { dateTimeLocal2UTC, dateTimeUTC2Local } from '@/utils/timeOperations';
import { InlineNotification, RadioButton, FormGroup } from '@carbon/react';
import { DAY_MS, HOUR_MS, MINUTE_MS } from '@/utils/constants/common';
import { useTranslations } from 'next-intl';
import { useDateTimeFormat } from '@/contexts/DateTimeFormatContext';
import DurationFilter from './DurationFilter';
import DateTimePicker from './DateTimePicker';

type Notification = {
  text: string;
  kind: 'error' | 'warning';
};

type FromSelectionType = 'duration' | 'specificTime';
type ToSelectionType = 'now' | 'specificTime';

interface TimeFrameSelectorProps {
  values: TimeFrameValues;
  setValues: React.Dispatch<React.SetStateAction<TimeFrameValues>>;
}

/**
 * Calculates the synchronized state from two valid dates.
 */
export const calculateSynchronizedState = (
  fromDate: Date,
  toDate: Date,
  timezone: string
): Omit<TimeFrameValues, 'isRelativeToNow' | 'fromSelectionType' | 'toSelectionType'> => {
  const fromUiParts = dateTimeUTC2Local(fromDate, timezone);
  const toUiParts = dateTimeUTC2Local(toDate, timezone);
  let difference = toDate.getTime() - fromDate.getTime();
  if (difference < 0) difference = 0;

  const durationDays = Math.floor(difference / DAY_MS);
  difference %= DAY_MS;
  const durationHours = Math.floor(difference / HOUR_MS);
  difference %= HOUR_MS;
  const durationMinutes = Math.floor(difference / MINUTE_MS);

  return {
    fromDate,
    fromTime: fromUiParts.time,
    fromAmPm: fromUiParts.amPm,
    toDate,
    toTime: toUiParts.time,
    toAmPm: toUiParts.amPm,
    durationDays,
    durationHours,
    durationMinutes,
  };
};

/**
 * Derives the radio button selection types from the TimeFrameValues.
 * This ensures radio buttons reflect the actual state from URL params.
 */
const deriveSelectionTypes = (
  values: TimeFrameValues
): { fromType: FromSelectionType; toType: ToSelectionType } => {
  // If explicitly set in values, use those
  if (values.fromSelectionType && values.toSelectionType) {
    return {
      fromType: values.fromSelectionType,
      toType: values.toSelectionType,
    };
  }

  // Fallback: derive from isRelativeToNow (for backward compatibility)
  const toType: ToSelectionType = values.isRelativeToNow ? 'now' : 'specificTime';
  const fromType: FromSelectionType = values.isRelativeToNow ? 'duration' : 'specificTime';

  return { fromType, toType };
};

/**
 * Validates timeframe and returns corrected dates with optional notification.
 */
export function validateTimeFrame(
  fromDate: Date,
  toDate: Date,
  toType: ToSelectionType,
  translations: (key: string, values?: Record<string, string | number | Date>) => string
): {
  correctedFrom: Date;
  correctedTo: Date;
  notification: Notification | null;
} {
  // Check if from is after to
  if (fromDate > toDate) {
    return {
      correctedFrom: fromDate,
      correctedTo: toDate,
      notification: {
        text:
          toType === 'now'
            ? translations('toBeforeFromWarningOnly')
            : translations('toBeforeFromErrorMessage'),
        kind: toType === 'now' ? 'warning' : 'error',
      },
    };
  }

  return { correctedFrom: fromDate, correctedTo: toDate, notification: null };
}

export default function TimeFrameSelector({ values, setValues }: TimeFrameSelectorProps) {
  const translations = useTranslations('TimeFrame');
  const { getResolvedTimeZone } = useDateTimeFormat();

  const [notification, setNotification] = useState<Notification | null>(null);

  // Derive radio button states from values
  const { fromType, toType } = deriveSelectionTypes(values);

  const handleValueChange = useCallback(
    (field: keyof TimeFrameValues, value: unknown) => {
      if ((field === 'fromDate' || field === 'toDate') && !value) {
        return;
      }

      setNotification(null);

      const draftValues = { ...values, [field]: value };
      const timezone = getResolvedTimeZone();

      // Combine date and time into Date objects
      let fromDate = dateTimeLocal2UTC(
        draftValues.fromDate,
        draftValues.fromTime,
        draftValues.fromAmPm,
        timezone
      );

      const toDate =
        toType === 'now'
          ? new Date()
          : dateTimeLocal2UTC(draftValues.toDate, draftValues.toTime, draftValues.toAmPm, timezone);

      const durationInMs =
        draftValues.durationDays * DAY_MS +
        draftValues.durationHours * HOUR_MS +
        draftValues.durationMinutes * MINUTE_MS;

      // Handle different field changes
      if (field.startsWith('duration')) {
        // Duration changed: adjust from date based on to date
        fromDate = new Date(toDate.getTime() - durationInMs);
      } else if (field.startsWith('to')) {
        // To date/time changed
        if (fromType === 'duration') {
          // If from is duration-based, recalculate from based on new to
          fromDate = new Date(toDate.getTime() - durationInMs);
        }
      }

      const {
        correctedFrom,
        correctedTo,
        notification: validationNotification,
      } = validateTimeFrame(fromDate, toDate, toType, translations);

      setNotification(validationNotification);

      // Update state only if no error
      if (validationNotification?.kind !== 'error') {
        const finalState = calculateSynchronizedState(correctedFrom, correctedTo, timezone);
        setValues((prevValues) => ({
          ...prevValues,
          ...finalState,
          fromSelectionType: fromType,
          toSelectionType: toType,
          isRelativeToNow: toType === 'now',
        }));
      }
    },
    [values, fromType, toType, translations, setValues, getResolvedTimeZone]
  );

  const handleFromTypeChange = useCallback(
    (newFromType: FromSelectionType) => {
      const timezone = getResolvedTimeZone();

      let toDate: Date;
      if (toType === 'now') {
        toDate = new Date();
      } else {
        toDate = dateTimeLocal2UTC(values.toDate, values.toTime, values.toAmPm, timezone);
      }

      let fromDate: Date;
      if (newFromType === 'duration') {
        // Switching to duration: calculate from based on current duration
        const durationInMs =
          values.durationDays * DAY_MS +
          values.durationHours * HOUR_MS +
          values.durationMinutes * MINUTE_MS;
        fromDate = new Date(toDate.getTime() - durationInMs);
      } else {
        // Switching to specific time: use current from values
        fromDate = dateTimeLocal2UTC(values.fromDate, values.fromTime, values.fromAmPm, timezone);
      }

      const {
        correctedFrom,
        correctedTo,
        notification: validationNotification,
      } = validateTimeFrame(fromDate, toDate, toType, translations);

      setNotification(validationNotification);

      if (validationNotification?.kind !== 'error') {
        const finalState = calculateSynchronizedState(correctedFrom, correctedTo, timezone);
        setValues((prevValues) => ({
          ...prevValues,
          ...finalState,
          fromSelectionType: newFromType,
          toSelectionType: toType,
          isRelativeToNow: toType === 'now',
        }));
      }
    },
    [values, toType, getResolvedTimeZone, translations, setValues]
  );

  const handleToTypeChange = useCallback(
    (newToType: ToSelectionType) => {
      const timezone = getResolvedTimeZone();

      let toDate: Date;
      if (newToType === 'now') {
        toDate = new Date();
      } else {
        toDate = dateTimeLocal2UTC(values.toDate, values.toTime, values.toAmPm, timezone);
      }

      let fromDate: Date;
      if (fromType === 'duration') {
        // From is duration-based: recalculate from based on new to
        const durationInMs =
          values.durationDays * DAY_MS +
          values.durationHours * HOUR_MS +
          values.durationMinutes * MINUTE_MS;
        fromDate = new Date(toDate.getTime() - durationInMs);
      } else {
        // From is specific time: use current from values
        fromDate = dateTimeLocal2UTC(values.fromDate, values.fromTime, values.fromAmPm, timezone);
      }

      const {
        correctedFrom,
        correctedTo,
        notification: validationNotification,
      } = validateTimeFrame(fromDate, toDate, newToType, translations);

      setNotification(validationNotification);

      if (validationNotification?.kind !== 'error') {
        const finalState = calculateSynchronizedState(correctedFrom, correctedTo, timezone);
        setValues((prevValues) => ({
          ...prevValues,
          ...finalState,
          fromSelectionType: fromType,
          toSelectionType: newToType,
          isRelativeToNow: newToType === 'now',
        }));
      }
    },
    [values, fromType, getResolvedTimeZone, translations, setValues]
  );

  return (
    <div className={styles.timeFrameContainer}>
      <div>
        <p>{translations('selectEnvelope')}</p>
        <p>{translations('envelopeDescription')}</p>
      </div>

      <FormGroup className={styles.formGroup} legendText="" role="radiogroup">
        <div className={styles.fromContainer}>
          <h3 className={styles.heading}>{translations('from')}</h3>

          <div className={styles.optionRow}>
            <RadioButton
              labelText={
                <span
                  dangerouslySetInnerHTML={{
                    __html: translations('durationTitle').replace(
                      '{boldTo}',
                      `<strong>${translations('boldTo')}</strong>`
                    ),
                  }}
                />
              }
              value="duration"
              id="from-duration"
              name="from-timeframe-options"
              checked={fromType === 'duration'}
              onChange={() => handleFromTypeChange('duration')}
            />
            <div className={styles.filterWrapper}>
              <DurationFilter
                values={values}
                handleValueChange={handleValueChange}
                disabled={fromType !== 'duration'}
              />
            </div>
          </div>
          <div className={styles.optionRow}>
            <RadioButton
              labelText={translations('specificTimeTitle')}
              value="specificTime"
              id="from-specific-time"
              name="from-timeframe-options"
              checked={fromType === 'specificTime'}
              onChange={() => handleFromTypeChange('specificTime')}
            />
            <div className={styles.filterWrapper}>
              <DateTimePicker
                prefixId="from"
                date={values.fromDate}
                time={values.fromTime}
                amPm={values.fromAmPm}
                onDateChange={(date) => handleValueChange('fromDate', date)}
                onTimeChange={(time) => handleValueChange('fromTime', time)}
                onAmPmChange={(amPm) => handleValueChange('fromAmPm', amPm)}
                disabled={fromType !== 'specificTime'}
                maxDate={new Date()}
              />
            </div>
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.toContainer}>
          <h3 className={styles.heading}>{translations('to')}</h3>
          <div className={styles.optionRow}>
            <RadioButton
              labelText={translations('nowTitle')}
              value="now"
              id="to-now"
              name="to-timeframe-options"
              checked={toType === 'now'}
              onChange={() => handleToTypeChange('now')}
            />
            <p className={styles.nowDescription}>{translations('nowDescription')}</p>
          </div>
          <div className={styles.optionRow}>
            <RadioButton
              labelText={translations('specificTimeTitle')}
              value="specificTime"
              id="to-specific-time"
              name="to-timeframe-options"
              checked={toType === 'specificTime'}
              onChange={() => handleToTypeChange('specificTime')}
            />
            <div className={styles.filterWrapper}>
              <DateTimePicker
                prefixId="to"
                date={values.toDate}
                time={values.toTime}
                amPm={values.toAmPm}
                onDateChange={(date) => handleValueChange('toDate', date)}
                onTimeChange={(time) => handleValueChange('toTime', time)}
                onAmPmChange={(amPm) => handleValueChange('toAmPm', amPm)}
                disabled={toType !== 'specificTime'}
              />
            </div>
          </div>
        </div>
      </FormGroup>

      {notification && (
        <InlineNotification
          className={styles.notification}
          kind={notification.kind}
          title={
            notification.kind === 'error'
              ? translations('invalidTimeFrame')
              : translations('autoCorrection')
          }
          subtitle={notification.text}
        />
      )}
    </div>
  );
}
