/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export const handleDeleteCookieApiOperation = async (router: any) => {

  const response = await fetch('/logout', { method: 'DELETE' });

  if (response.status === 204) {

    //auto redirect to render dex login page
    router.refresh();

  }
};

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

    result = "Invalid date";

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
 * Function to get yesterday's date at the current time.
 * 
 * @returns a Date object representing yesterday's date at the current time
 */
export const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

/**
 * A mapping of timezone abbreviations to their UTC offsets.
 */
const TIMEZONE_OFFSETS: { [key: string]: string } = {
  'GMT': '+00:00', 
  'PDT': '-07:00', 
};

/**
 *  Combines date, time, AM/PM, and timezone parts into a single, accurate Date object.
 * 
 * @param date - The date part as a Date object.
 * @param time - The time part as a string in 'HH:MM' format.
 * @param amPm - The AM/PM part as a string ('AM' or 'PM').
 * @param timezone - The timezone part as a string (e.g., 'GMT', 'PDT').
 * 
 * @return A Date object representing the combined date and time in the specified timezone.
 */
const combineDateTime = (date: Date, time: string, amPm: 'AM' | 'PM', timezone: string): Date => {
  // Get the UTC offsets for the specified timezone
  const offset = TIMEZONE_OFFSETS[timezone] || '+00:00';

  // Convert 12-hour time with AM/PM to 24-hour format
  let [hours, minutes] = time.split(':').map(Number);
  let hours24 = hours;
  if (amPm === 'PM' && hours < 12) {
    hours24 += 12; // Convert PM to 24-hour format
  }
  if (amPm === 'AM' && hours === 12) {
    hours24 = 0; // Convert 12 AM to 0 hours
  }

  // Format the date and time parts with leading zeroes to ensure a valid ISO string
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hoursStr = String(hours24).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');

  const isoString = `${year}-${month}-${day}T${hoursStr}:${minutesStr}:00${offset}`;
  return new Date(isoString);
}