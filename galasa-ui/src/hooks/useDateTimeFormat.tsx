/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";

import { PREFERENCE_KEYS } from "@/utils/constants/common";
import { DateTimeFormats, Locale, TimeFormat } from "@/utils/types/dateTimeFormat";
import { useState } from "react";

const LOCAL_STORAGE_KEY = 'dateTimeFormatSettings';

interface UseDateTimeFormatReturn {
  preferences: {
    [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: DateTimeFormats;
    [PREFERENCE_KEYS.LOCALE]: Locale['code'];
    [PREFERENCE_KEYS.TIME_FORMAT]: TimeFormat['label'];
  };
  updatePreferences: (newPreferences: Partial<UseDateTimeFormatReturn['preferences']>) => void;
}

export default function useDateTimeFormat() : UseDateTimeFormatReturn {
  const [preferences, setPreferences] = useState<UseDateTimeFormatReturn['preferences']>(() => {
    // Load preferences from local storage or set default values
    const storedPreferences = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedPreferences ? JSON.parse(storedPreferences) : {
      [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: 'browser',
      [PREFERENCE_KEYS.LOCALE]: 'en-US',
      [PREFERENCE_KEYS.TIME_FORMAT]: '12-hour'
    };
  });

  const updatePreferences = (newPreferences: Partial<typeof preferences>) => {
    let updatedPreferences = { ...preferences, ...newPreferences };
    if (newPreferences[PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE] === 'browser') {
      updatedPreferences = {
        ...preferences,
        ...newPreferences,
        [PREFERENCE_KEYS.LOCALE]: 'en-US',
        [PREFERENCE_KEYS.TIME_FORMAT]: '12-hour'
      };
    } 
    setPreferences(updatedPreferences);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPreferences));
  };

  return { preferences, updatePreferences };
}