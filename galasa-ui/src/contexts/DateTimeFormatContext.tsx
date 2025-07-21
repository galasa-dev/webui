/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { PREFERENCE_KEYS } from "@/utils/constants/common";
import { DateTimeFormats, Locale, TimeFormat } from "@/utils/types/dateTimeFormat";
import { useCallback, useState, createContext, useContext } from "react";


const LOCAL_STORAGE_KEY = 'dateTimeFormatSettings';

interface DateTimeFormatContextType {
  preferences: {
    [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: DateTimeFormats;
    [PREFERENCE_KEYS.LOCALE]: Locale['code'];
    [PREFERENCE_KEYS.TIME_FORMAT]: TimeFormat['label'];
  };
  updatePreferences: (newPreferences: Partial<DateTimeFormatContextType['preferences']>) => void;
  formatDate: (date: Date) => string;
}

const DateTimeFormatContext = createContext<DateTimeFormatContextType | undefined>(undefined);

export function DateTimeFormatProvider({ children }: { children: React.ReactNode }) {
  const defaultPreferences = {
    [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: 'browser',
    [PREFERENCE_KEYS.LOCALE]: 'en-US',
    [PREFERENCE_KEYS.TIME_FORMAT]: '12-hour'
  };

  const [preferences, setPreferences] = useState<DateTimeFormatContextType['preferences']>(() => {
    if (typeof window === 'undefined') {
      // Return default state during SSR
      return defaultPreferences;
    }

    // Load preferences from local storage or set default values
    const storedPreferences = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedPreferences ? JSON.parse(storedPreferences) : defaultPreferences;
  });

  const updatePreferences = (newPreferences: Partial<typeof preferences>) => {
    let updatedPreferences = { ...preferences, ...newPreferences };
    if (newPreferences[PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE] === 'browser') {
      updatedPreferences = {
        ...preferences,
        ...defaultPreferences
      } as DateTimeFormatContextType['preferences'];
    } 
    setPreferences(updatedPreferences);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPreferences));
  };

  const formatDate = useCallback((date: Date): string => {
    let formattedDate: string = '';
    try {

      if(!(date instanceof Date)) {
        throw new Error("Invalid date provided to formatDate");
      }

      const { dateTimeFormatType, locale, timeFormat } = preferences;
        
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: timeFormat === '12-hour',
      };

      if (dateTimeFormatType === 'browser') {
        // Pass undefined to use the browser's default locale
        formattedDate = new Intl.DateTimeFormat(undefined, options).format(date);
      } else {
        // Use the custom locale
        formattedDate = new Intl.DateTimeFormat(locale, options).format(date);
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      formattedDate = '';
    }  

    return formattedDate;
  }, [preferences]);
  
  const value = { preferences, updatePreferences, formatDate };

  return (
    <DateTimeFormatContext.Provider value={value}>
      {children}
    </DateTimeFormatContext.Provider>
  );
};

export function useDateTimeFormat() {
  const context = useContext(DateTimeFormatContext);
  if (context === undefined) {
    throw new Error('useDateTimeFormat must be used within a DateTimeFormatProvider');
  }
  return context;
}