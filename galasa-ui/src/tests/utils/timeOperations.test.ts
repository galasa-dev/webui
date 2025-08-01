/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */


import { combineDateTime, extractDateTimeForUI } from '@/utils/timeOperations';
import { AmPm } from '@/utils/types/common';

describe('DateTime Timezone Utils', () => {

  describe('combineDateTime', () => {
    test('should correctly handle a PM time during Daylight Saving Time', () => {
      // New York is in (UTC-4) in July. 9:55 PM EDT is 01:55 UTC on the next day.
      const date = new Date('2025-07-31T00:00:00Z'); // Day is 31st
      const time = '09:55';
      const amPm: AmPm = 'PM';
      const timezone = 'America/New_York';
      
      const result = combineDateTime(date, time, amPm, timezone);
      
      // The universal time should be 01:55 on Aug 1st.
      expect(result.toISOString()).toBe('2025-08-01T01:55:00.000Z');
    });

    test('should correctly handle an AM time during Standard Time', () => {
      // New York is in (UTC-5) in December. 7:30 AM EST is 12:30 UTC on the same day.
      const date = new Date('2025-12-25T00:00:00Z');
      const time = '07:30';
      const amPm: AmPm = 'AM';
      const timezone = 'America/New_York';
      
      const result = combineDateTime(date, time, amPm, timezone);
      
      expect(result.toISOString()).toBe('2025-12-25T12:30:00.000Z');
    });

    test('should handle the midnight (12 AM) edge case correctly', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const time = '12:15';
      const amPm: AmPm = 'AM';
      const timezone = 'Europe/London'; // UTC+0 in winter
      
      const result = combineDateTime(date, time, amPm, timezone);
      
      // 12:15 AM on Jan 1st is 00:15 UTC on the same day.
      expect(result.toISOString()).toBe('2024-01-01T00:15:00.000Z');
    });
    
    test('should handle the noon (12 PM) edge case correctly', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      const time = '12:45';
      const amPm: AmPm = 'PM';
      const timezone = 'Europe/London'; // UTC+0 in winter
      
      const result = combineDateTime(date, time, amPm, timezone);
      
      expect(result.toISOString()).toBe('2024-01-01T12:45:00.000Z');
    });

    test('should work correctly for timezones ahead of UTC', () => {
      // Tokyo is JST (UTC+9). 8:00 AM on Feb 10th is 23:00 UTC on the previous day.
      const date = new Date('2024-02-10T00:00:00Z');
      const time = '08:00';
      const amPm: AmPm = 'AM';
      const timezone = 'Asia/Tokyo';
      
      const result = combineDateTime(date, time, amPm, timezone);

      // The universal time should be 23:00 on Feb 9th.
      expect(result.toISOString()).toBe('2024-02-09T23:00:00.000Z');
    });
  });

  describe('extractDateTimeForUI', () => {
    test('should correctly extract PM time for a timezone during Daylight Saving Time', () => {
      // The universal time 2025-08-01T01:55:00.000Z corresponds to 9:55 PM in New York.
      const date = new Date('2025-08-01T01:55:00.000Z');
      const timezone = 'America/New_York';

      const result = extractDateTimeForUI(date, timezone);
      
      expect(result).toEqual({ time: '09:55', amPm: 'PM' });
    });

    test('should correctly extract AM time for a timezone during Standard Time', () => {
      // The universal time 2025-12-25T12:30:00.000Z corresponds to 7:30 AM in New York.
      const date = new Date('2025-12-25T12:30:00.000Z');
      const timezone = 'America/New_York';

      const result = extractDateTimeForUI(date, timezone);
      
      expect(result).toEqual({ time: '07:30', amPm: 'AM' });
    });
    
    test('should correctly extract midnight (12 AM) edge case', () => {
      // The universal time 2024-01-01T00:15:00.000Z is 12:15 AM in London.
      const date = new Date('2024-01-01T00:15:00.000Z');
      const timezone = 'Europe/London';

      const result = extractDateTimeForUI(date, timezone);
      
      expect(result).toEqual({ time: '12:15', amPm: 'AM' });
    });
    
    test('should correctly extract noon (12 PM) edge case', () => {
      // The universal time 2024-01-01T12:45:00.000Z is 12:45 PM in London.
      const date = new Date('2024-01-01T12:45:00.000Z');
      const timezone = 'Europe/London';

      const result = extractDateTimeForUI(date, timezone);
      
      expect(result).toEqual({ time: '12:45', amPm: 'PM' });
    });
    
    test('should correctly extract time for a timezone ahead of UTC', () => {
      // The universal time 2024-02-09T23:00:00.000Z corresponds to 8:00 AM on Feb 10th in Tokyo.
      const date = new Date('2024-02-09T23:00:00.000Z');
      const timezone = 'Asia/Tokyo';

      const result = extractDateTimeForUI(date, timezone);
      
      expect(result).toEqual({ time: '08:00', amPm: 'AM' });
    });
  });
});