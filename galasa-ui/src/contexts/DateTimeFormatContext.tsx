/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { PREFERENCE_KEYS } from "@/utils/constants/common";
import { DateTimeFormats, Locale, TimeFormat, TimeZone, TimeZoneFormats } from "@/utils/types/dateTimeSettings";
import { useCallback, useState, createContext, useContext } from "react";


const LOCAL_STORAGE_KEY = 'dateTimeFormatSettings';

/**
 * DateTimeFormatContextType defines the structure of the context used for date and time formatting preferences.
 * 
 * It includes:
 * - preferences: An object containing the current date and time formatting preferences.
 * - updatePreferences: A function to update the preferences.
 * - formatDate: A function to format a given date based on the current preferences.
 */
interface DateTimeFormatContextType {
  preferences: {
    [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: DateTimeFormats;
    [PREFERENCE_KEYS.LOCALE]: Locale['code'];
    [PREFERENCE_KEYS.TIME_FORMAT]: TimeFormat['label'];
    [PREFERENCE_KEYS.TIME_ZONE_TYPE]: TimeZoneFormats;
    [PREFERENCE_KEYS.TIME_ZONE]: TimeZone['iana']; 
  };
  updatePreferences: (newPreferences: Partial<DateTimeFormatContextType['preferences']>) => void;
  formatDate: (date: Date) => string;
  getResolvedTimeZone: () => string;
}

const DateTimeFormatContext = createContext<DateTimeFormatContextType | undefined>(undefined);

/**
 * DateTimeFormatProvider component provides the context for date and time formatting preferences.
 * It manages the preferences state and provides methods to update preferences and format dates.
 * 
 * @param { children } - The child components that will have access to the DateTimeFormatContext.
 */
export function DateTimeFormatProvider({ children }: { children: React.ReactNode }) {
  const defaultPreferences: DateTimeFormatContextType['preferences'] = {
    [PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE]: 'browser' as DateTimeFormats,
    [PREFERENCE_KEYS.LOCALE]: 'en-US',
    [PREFERENCE_KEYS.TIME_FORMAT]: '12-hour' as TimeFormat['label'],
    [PREFERENCE_KEYS.TIME_ZONE_TYPE]: 'browser' as TimeZoneFormats,
    [PREFERENCE_KEYS.TIME_ZONE]: 'UTC' as TimeZone['iana'], 
  };

  const [preferences, setPreferences] = useState<DateTimeFormatContextType['preferences']>(() => {
    let currentPreferences: DateTimeFormatContextType['preferences'] = defaultPreferences;
    if (typeof window !== 'undefined') {
      // Load preferences from local storage or set default values
      const storedPreferences = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedPreferences) {
        currentPreferences = {...defaultPreferences, ...JSON.parse(storedPreferences)};
      }
    }
    return currentPreferences;
  });

  const updatePreferences = (newPreferences: Partial<typeof preferences>) => {
    let updatedPreferences = { ...preferences, ...newPreferences };

    // If format type is set to 'browser', reset related fields
    if (newPreferences[PREFERENCE_KEYS.DATE_TIME_FORMAT_TYPE] === 'browser') {
      updatedPreferences[PREFERENCE_KEYS.LOCALE] = defaultPreferences[PREFERENCE_KEYS.LOCALE];
      updatedPreferences[PREFERENCE_KEYS.TIME_FORMAT] = defaultPreferences[PREFERENCE_KEYS.TIME_FORMAT];
    } 

    // If time zone format type is set to 'browser', reset time zone
    if (newPreferences[PREFERENCE_KEYS.TIME_ZONE_TYPE] === 'browser') {
      updatedPreferences[PREFERENCE_KEYS.TIME_ZONE] = defaultPreferences[PREFERENCE_KEYS.TIME_ZONE];
    }

    setPreferences(updatedPreferences);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedPreferences));
  };

  // Helper function to determine which timezone to use 
  const getResolvedTimeZone = useCallback((): string => {
    // Fallback to the browser's actual detected timezone
    let specifiedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (preferences.timeZoneType === 'custom' && preferences.timeZone) {
      specifiedTimeZone = preferences.timeZone;
    }
    
    return specifiedTimeZone;
  }, [preferences.timeZoneType, preferences.timeZone]);


  const formatDate = useCallback((date: Date): string => {
    let formattedDate: string = '-';
    try {

      if(!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error("Invalid date provided to formatDate");
      }

      const { dateTimeFormatType, locale, timeFormat } = preferences;
      const resolvedTimeZone = getResolvedTimeZone();

      // Define options for the main date/time part
      const dateTimeOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: timeFormat === '12-hour',
        timeZone: resolvedTimeZone,
      };

      // Define options specifically to extract the timezone name
      const timeZoneNameOptions: Intl.DateTimeFormatOptions = {
        timeZone: resolvedTimeZone,
        timeZoneName: "short", // e.g., PST, EDT, EEST
      };

      // Determine the locale to use 
      const effectiveLocale = dateTimeFormatType === 'browser' ? undefined : locale;

      // Format the two parts separately
      const mainPart = new Intl.DateTimeFormat(effectiveLocale, dateTimeOptions).format(date);
      
      // Get the full string with timezone
      const fullStringWithTz = new Intl.DateTimeFormat(effectiveLocale, { ...dateTimeOptions, ...timeZoneNameOptions }).format(date);
      const timeZonePart = fullStringWithTz.split(' ').pop() || '';

      // Combine them into the desired final format (e.g., "MM/DD/YYYY, HH:mm:ss (GMT+X)")
      formattedDate = `${mainPart} (${timeZonePart})`;
    } catch (error) {
      console.error("Error formatting date:", error);
    }  

    return formattedDate;
  }, [preferences, getResolvedTimeZone]);



  const value = { preferences, updatePreferences, formatDate, getResolvedTimeZone};

  return (
    <DateTimeFormatContext.Provider value={value}>
      {children}
    </DateTimeFormatContext.Provider>
  );
};

/**
 * useDateTimeFormat is a custom hook that provides access to the DateTimeFormatContext.
 * 
 * @returns {DateTimeFormatContextType} - The context value for date and time formatting preferences.
 */
export function useDateTimeFormat(): DateTimeFormatContextType {
  const context = useContext(DateTimeFormatContext);
  if (context === undefined) {
    throw new Error('useDateTimeFormat must be used within a DateTimeFormatProvider');
  }
  return context;
}