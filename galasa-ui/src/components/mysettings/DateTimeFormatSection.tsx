/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { useDateTimeFormat } from "@/contexts/DateTimeFormatContext";
import styles from "@/styles/DateTimeFormatSection.module.css";
import { PREFERENCE_KEYS, SUPPORTED_LOCALES, TIME_FORMATS } from "@/utils/constants/common";
import { Dropdown } from "@carbon/react";
import { RadioButton, RadioButtonGroup } from '@carbon/react';

type DateTimeFormats = 'custom' | 'browser'
type Locale = { code: string; format: string; };
type TimeFormat = { label: string; format: string };

export default function DateTimeFormatSection() {
  const {preferences, updatePreferences} = useDateTimeFormat();

  const handleChange = (key: keyof typeof preferences, value: string) => {
    updatePreferences({ [key]: value });
  };

  return (
    <section  className={styles.section}>
      <h3>Date/Time Format</h3>
      <div className={styles.container}>
        <p className={styles.title}>Configure the format for displaying date and time.</p>
        <RadioButtonGroup 
          legendText="Date/Time Format"
          name="date-time-format"
          orientation="vertical"
          valueSelected={preferences.dateTimeFormatType}
          onChange={(value: string) => handleChange(PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE, value as DateTimeFormats)}
        >
          <RadioButton 
            labelText="Show dates and times based on the browser locale"
            value="browser"
            id="browser-date-time-format"
          />
          <RadioButton 
            labelText="Show dates and times based on a custom locale"
            value="custom"
            id="custom-date-time-format"
          />
          <div className={styles.dropdownContainer}>
            <Dropdown 
              helperText="Select a locale"
              id="custom-locale-dropdown"
              items={SUPPORTED_LOCALES}
              itemToString={(item: Locale) => (item ? `${item.code} ${item.format}` : '')}
              selectedItem={SUPPORTED_LOCALES.find(item => item.code === preferences.locale)}
              onChange={(e: {selectedItem: Locale}) => handleChange(PREFERENCE_KEYS.LOCALE, e.selectedItem?.code || SUPPORTED_LOCALES[0].code)}
              size="lg"
              disabled={preferences.dateTimeFormatType !== 'custom'}
            />
            <Dropdown
              helperText="Select a time format"
              id="custom-time-format-dropdown"
              items={TIME_FORMATS}
              itemToString={(item: TimeFormat) => (item ? `${item.label} ${item.format}` : '')}
              selectedItem={TIME_FORMATS.find(item => item.label === preferences.timeFormat)}
              onChange={(e: {selectedItem: TimeFormat}) => handleChange(PREFERENCE_KEYS.TIME_FORMAT, e.selectedItem?.label || TIME_FORMATS[0].label)}
              size="lg"
              disabled={preferences.dateTimeFormatType !== 'custom'}
            />
          </div>

        </RadioButtonGroup>
      </div>
    </section>
  );
}