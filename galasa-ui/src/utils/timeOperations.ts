/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { AmPm } from "./types/common";
import moment from "moment-timezone";

export function parseIsoDateTime(isoString: string) {
  // Construct a Date object
  const dt = new Date(isoString);
  let formattedDateTime = "";

  if (isNaN(dt.getTime())) {
    formattedDateTime = "Invalid date";
  } else {

    // Pad helper
    const pad = (n: number) => n.toString().padStart(2, '0');

    // Extract components
    const year = dt.getUTCFullYear();
    const month = pad(dt.getUTCMonth() + 1);
    const day = pad(dt.getUTCDate());
    const hours = pad(dt.getUTCHours());
    const mins = pad(dt.getUTCMinutes());
    const secs = pad(dt.getUTCSeconds());

    const date = `${day}/${month}/${year}`;
    const time = `${hours}:${mins}:${secs}`;

    formattedDateTime = `${date} ${time}`;
  }

  return formattedDateTime;

}


/**
 * Calculates the absolute time difference between two ISO timestamps
 * and formats it as a human-readable string.
 *
 * Examples:
 *   getIsoTimeDifference("2025-05-28T09:07:19Z", "2025-05-28T09:09:43Z")
 *     → "2 mins 24 secs"
 *   getIsoTimeDifference("2025-05-28T06:00:00Z", "2025-05-28T09:52:02Z")
 *     → "3 hrs 52 mins 2 secs"
 *
 * @param startTime - the start time
 * @param endTime - the end time
 * @returns formatted duration string
 */
export function getIsoTimeDifference(startTime: string, endTime: string): string {

  
  let result: string;
  const dt1 = new Date(startTime);
  const dt2 = new Date(endTime);

  // If either parse failed, produce an error message
  if (isNaN(dt1.getTime()) || isNaN(dt2.getTime())) {
    result = "N/A";
  } else {

    const startedAt = Date.parse(startTime);
    const endedAt   = Date.parse(endTime);
    // Compute absolute delta in seconds
    let delta = Math.abs(endedAt - startedAt) / 1000;

    // Break into components
    const hours   = Math.floor(delta / 3600);
    delta         -= hours * 3600;
    const minutes = Math.floor(delta / 60);
    const seconds = Math.round((delta - minutes * 60) * 10) / 10;

    const parts = buildTimeDifference(hours, minutes, seconds);
    result = parts.join(" ");
  }

  return result;
}

const buildTimeDifference = (hours : number, minutes : number, seconds: number) => {

  const parts: string[] = [];

  if (hours   > 0) {
    parts.push(`${hours} hr${hours   !== 1 ? "s" : ""}`);
  } 
  
  if (minutes > 0) {
    parts.push(`${minutes} min${minutes !== 1 ? "s" : ""}`);
  }
  if (seconds > 0 || parts.length === 0) {
    parts.push(`${seconds} sec${seconds !== 1 ? "s" : ""}`);
  }

  return parts;
};

/**
 * Combines date, time, AM/PM, and timezone parts into a single, accurate Date object.
 *
 * This function uses moment-timezone to ensure the date and time are interpreted
 * correctly in the context of the specified timezone.
 *
 * @param date - The date part as a Date object. Only its year, month, and day are used.
 * @param time - The time part as a string in 'HH:MM' format.
 * @param amPm - The AM/PM part as a string ('AM' or 'PM').
 * @param timezone - The IANA timezone identifier (e.g., 'America/New_York', 'Europe/London').
 *
 * @returns A standard JavaScript `Date` object representing the precise universal moment in time.
 *          Note: The returned `Date` object is timezone-agnostic. When printed to the console,
 *          it will be displayed in the local timezone of the environment. To see its UTC value,
 *          use the `.toISOString()` method.
 *
 * @example
 *  To create a Date for July 31, 2025, at 9:55 PM in New York (which is UTC-4):
 * dateTimeLocal2UTC(new Date('2025-07-31'), '09:55', 'PM', 'America/New_York');
 *  The returned Date object's .toISOString() will be "2025-08-01T01:55:00.000Z"
*/
export const dateTimeLocal2UTC = (date: Date, time: string, amPm: AmPm, timezone: string): Date => {
  const [hoursStr, minutesStr] = time.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);

  if (amPm === 'PM' && hours < 12) {
    hours += 12;
  }
  if (amPm === 'AM' && hours === 12) { // Handle midnight case
    hours = 0;
  }

  // Format the date part (YYYY-MM-DD)
  const datePart = moment(date).format('YYYY-MM-DD');

  // Combine date and time into a single string
  const dateTimeStr = `${datePart} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

  // Interpret the string in the specified timezone, then format it into a full ISO string, which includes the correct timezone offset.
  const isoStringWithTimezone = moment.tz(dateTimeStr, 'YYYY-MM-DD HH:mm:ss', timezone).format();

  // Create a universal Date object from the reliable ISO string.
  return new Date(isoStringWithTimezone);
};

/**
 * Deconstructs a universal Date object into UI parts (time and AM/PM)
 * for a specific timezone. This is the inverse of `dateTimeLocal2UTC`.
 *
 * It ensures UI components display the time correctly according to the
 * user's selected timezone, not their browser's local time.
 *
 * @param date - The date to extract time from, as a JavaScript Date object.
 * @param timezone - The IANA timezone (e.g., 'America/New_York') to interpret the date in.
 * @returns An object with `{ time: 'hh:mm', amPm: 'AM'|'PM' }` for the target timezone.
 *
 * @example
 * What time was it in New York (UTC-4) at the moment '2025-08-01T01:55:00.000Z'?
 * dateTimeUTC2Local(new Date('2025-08-01T01:55:00.000Z'), 'America/New_York');
 * returns -> { time: '09:55', amPm: 'PM' }
 */
export const dateTimeUTC2Local = (date: Date, timezone: string) => {
  // 1. Create a moment object from the universal Date and tell it
  //  to interpret that moment in the context of the desired timezone.
  const momentInZone = moment.tz(date, timezone);

  // 2. Format the parts using moment's timezone-aware formatting.
  const timeValue = momentInZone.format('hh:mm'); // 'hh' = 12-hour format (01-12)
  const amPmValue = momentInZone.format('A') as AmPm; // 'A' = AM/PM

  return {
    time: timeValue,
    amPm: amPmValue,
  };
};

/**
 * Gets the date and time for "yesterday" at midnight.
 * 
 * @returns A Date object representing yesterday at midnight.
 */
export function getYesterday(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1); 

  // Reset time to midnight
  yesterday.setHours(0, 0, 0, 0); 
  return yesterday;
};

/**
 * Gets the date and time for "two days ago" at midnight.
 * 
 * @returns A Date object representing two days ago at midnight.
 */
export function getAWeekBeforeSubmittedTime(submittedAt: string): string | null {

  let result: string | null;
  const submittedDate = new Date(submittedAt);

  if(isNaN(submittedDate.getTime())) {
    result = null;
  } else {

    const weekBefore = new Date();
    weekBefore.setDate(weekBefore.getDate() - 7); 

    // Reset time to midnight
    weekBefore.setHours(0, 0, 0, 0); 
    result = weekBefore.toISOString();
  
  }

  return result;
};

/**
 * Gets the date and time for "one month ago" at midnight.
 * 
 * @returns A Date object representing one month ago at midnight.
 */
export function getOneMonthAgo(): string {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  date.setHours(0, 0, 0, 0); // Reset time to midnight
  return date.toISOString();
}

/**
 * Accurately adds a number of months to a date, handling end-of-month edge cases.
 * If the original day doesn't exist in the target month, it will use the last valid day.
 * 
 * @param date The starting date.
 * @param months The number of months to add.
 * @returns A new Date object.
 */
export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  const originalDay = newDate.getDate();
  newDate.setMonth(newDate.getMonth() + months);

  if (newDate.getDate() !== originalDay) {
    newDate.setDate(0);
  }

  return newDate;
}


/**
 * Parses a time string and validates it.
 * If the string is a valid time (e.g., "9:5", "14:30"), it returns an object with the hour and minute.
 * Otherwise, it returns null.
 *
 * @param {string} timeString - The string to parse.
 * @returns {{hour: number, minute: number} | null} The parsed time parts or null if invalid.
 */
export const parseAndValidateTime = (timeString: string) => {
  if(!timeString) return null;

  let parsedTime = null;

  // Expecting time in 'HH:MM' format, so splitting into [hours, minutes]
  const TIME_PARTS_EXPECTED = 2;
  // parseInt radix for base-10 numbers
  const DECIMAL_RADIX = 10;
  const parts = timeString.trim().split(':');

  if (parts.length === TIME_PARTS_EXPECTED) {
    
    // Parse hours and minutes as base-10 integers
    const hour = parseInt(parts[0], DECIMAL_RADIX);
    const minute = parseInt(parts[1], DECIMAL_RADIX);

    // Validate hour and minute ranges for 12-hour time
    const isValid = !isNaN(hour) && !isNaN(minute) &&
                    hour >= 0 && hour <= 12 &&
                    minute >= 0 && minute <= 59;

    // If valid, format the time as "HH:MM"
    if (isValid) {
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      parsedTime = `${formattedHour}:${formattedMinute}`;
    }
  }

  return parsedTime;
};
