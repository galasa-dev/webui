# Guide to Date and Timezone Handling in the Galasa UI
This document outlines the standardized approach for handling all date and time-related operations within the codebase. The goal is to eliminate timezone ambiguity, ensure data consistency between the UI and server, and provide a clear and intuitive experience for users, regardless of their location.

The **core principle** of our date handling strategy is simple:
> Store and process all dates in UTC. Display all dates to the user via the `formatDate` utility.

Adhering to this rule prevents a wide range of common bugs related to timezones and Daylight Saving Time.

## What's New?
- A new timezone selection section is available in the user settings page.
- All dates and time displays throughout the UI have been updated to respect the user's selected timezone preference (or their browser's default)
- Date formatting logic has been consolidated into a central React context to ensure consistency

## Core Concepts & Implementation
The entire system is built around the `DateTimeFormatContext`.
- **`DateTimeFormatProvider`**: This component must wrap the entire application (e.g., in `layout.tsx`). It is responsible for initializing user preferences from `localStorage` and making them available to all child components.
- **`useDateTimeFormat`**: This custom hook is the primary way components should interact with the system. It provides access to the user's preferences and, most importantly, the formatting utilities.

> [! Note] 
> Preferences are currently saved in the localStorage but we plan to move all preferences to be saved in the server per user. 
> 

### How it Works
1.  **Internal Standard: UTC**: All dates received from the API are expected to be in UTC (typically as an ISO 8601 string, e.g., `"2023-10-26T12:00:00.000Z"`). When we create new `Date` objects in the code, they represent a universal point in time, independent of any timezone.
2. **Displaying Dates to the User**: To show a date in the UI, you must use the `formatDate` function from the `useDateTimeFormat` hook.
```typescript
const { formatDate } = useDateTimeFormat(); 
```

The formatDate function automatically handles everything:
- It reads the user's chosen timezone (e.g., 'America/New_York') from the context.
- It reads the user's chosen locale (e.g., 'en-GB') for correct date ordering (DD/MM/YYYY).
- It reads the user's time format preference (12-hour or 24-hour).
- It combines these to produce a correctly formatted, human-readable string.

## UI-to-UTC Conversion Utilities
In some cases, especially when a user is **inputting** a specific time, we need to perform the conversion in reverse: from UI-friendly parts into a single UTC Date object. Two utility functions exist for this purpose.

#### `extractDateTimeForUI(date, timezone)`
- This function performs UTC -> UI conversion. To deconstruct a universal UTC Date object into parts that can populate UI controls (like a time picker and an AM/PM dropdown).
- Use this when you fetch something from the backend and need to display its time to the user for editing.
```typescript
const utcDate = new Date('2025-08-01T01:55:00.000Z');
const userTimezone = 'America/New_York';

const uiParts = extractDateTimeForUI(utcDate, userTimezone);
// uiParts is now: { time: '09:55', amPm: 'PM' }
```
#### `combineDateTime(date, time, amPm, timezone)`
- This function performs UI -> UTC conversion. To take the separate date, time, and AM/PM values from UI controls and combine them into a single UTC Date object that can be sent to the backend.
- Use this when a user saves a form where they have entered or edited a specific time.
```typescript
 
const dateFromCalendar = new Date('2025-07-31');
const timeFromInput = '09:55'; 
const amPmFromInput = 'PM'; 
const userTimezone = 'America/New_York';  

const utcDateToSend = combineDateTime(   dateFromCalendar,   timeFromInput,   amPmFromInput,   userTimezone );  
// utcDateToSend is now a Date object whose UTC value is '2025-08-01T01:55:00.000Z'.
// We can now send utcDateToSend.toISOString() to the API.
```
    
