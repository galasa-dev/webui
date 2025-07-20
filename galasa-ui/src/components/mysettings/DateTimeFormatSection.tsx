/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import styles from "@/styles/DateTimeFormatSection.module.css";
import { SUPPORTED_LOCALES, TIME_FORMATS } from "@/utils/constants/common";
import { Dropdown } from "@carbon/react";
import { RadioButton, RadioButtonGroup } from '@carbon/react';
import { useState } from "react";

type dateTimeFormats = 'custom' | 'browser'

export default function DateTimeFormatSection() {
  const [dateTimeFormatType, setDateTimeFormatType] = useState<dateTimeFormats>('browser');

  return (
    <section  className={styles.section}>
      <h3>Date/Time Format</h3>
      <div className={styles.container}>
        <p className={styles.title}>Configure the format for displaying date and time. Default: <code>MM-DD-YYYY HH:mm:ss AM/PM</code></p>
        <RadioButtonGroup 
          legendText="Date/Time Format"
          name="date-time-format"
          orientation="vertical"
          valueSelected={dateTimeFormatType}
          onChange={(value: string) => setDateTimeFormatType(value as dateTimeFormats)}
        >
          <RadioButton 
            labelText="Show dates and times based on the browser locales"
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
              label="Locale"
              id="custom-locale-dropdown"
              items={SUPPORTED_LOCALES}
              itemToString={(item: {code: string, format: string, example: string}) => (item ? `${item.code} ${item.example} ${item.format}` : '')}
              size="lg"
              disabled={dateTimeFormatType !== 'custom'}
            />
            <Dropdown
              helperText="Select a time format"
              label="Time Format"
              id="time-format-dropdown"
              items={TIME_FORMATS}
              itemToString={(item: {label: string, format: string}) => (item ? `${item.label} ${item.format}` : '')}
              size="lg"
              disabled={dateTimeFormatType !== 'custom'}
            />
          </div>

        </RadioButtonGroup>
      </div>
    </section>
  );
}