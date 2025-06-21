/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import { applyTimeFrameRules } from '@/components/test-runs/TimeFrameContent';
import { addMonths } from '@/utils/functions';


describe('applyTimeFrameRules', () => {
  // A default "now" for tests that need to check against the current time.
  const MOCK_NOW = new Date('2025-08-20T12:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should return null notification for a valid date range in the past', () => {
    jest.setSystemTime(MOCK_NOW);
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-17T10:00:00.000Z');
    const { notification, correctedTo } = applyTimeFrameRules(fromDate, toDate);

    expect(notification).toBeNull();
    expect(correctedTo).toEqual(toDate);
  });

  test('should return null notification if "To" date is exactly "now"', () => {
    jest.setSystemTime(MOCK_NOW);
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const { notification } = applyTimeFrameRules(fromDate, MOCK_NOW);

    expect(notification).toBeNull();
  });

  test('should return a warning and cap the "To" date if it is in the future', () => {
    jest.setSystemTime(MOCK_NOW);
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    // Set a date 5 minutes into the future from our mocked "now"
    const futureDate = new Date(MOCK_NOW.getTime() + 5 * 60 * 1000);
    const { correctedTo, notification } = applyTimeFrameRules(fromDate, futureDate);

    expect(notification?.kind).toEqual('warning');
    expect(notification?.text).toEqual('Date range was capped at the current time.');
    // Ensure the date is capped exactly to our mocked "now"
    expect(correctedTo.toISOString()).toEqual(MOCK_NOW.toISOString());
  });

  test('should return an error if "From" date is after "To" date', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-14T10:00:00.000Z'); // One day before
    const { correctedFrom, correctedTo, notification } = applyTimeFrameRules(fromDate, toDate);

    expect(notification?.kind).toEqual('error');
    expect(notification?.text).toEqual("'To' date cannot be before 'From' date.");
       
    // Ensure dates are not modified on a hard error
    expect(correctedFrom).toEqual(fromDate);
    expect(correctedTo).toEqual(toDate);
  });

  test('should return null notification if "From" and "To" dates are the same', () => {
    jest.setSystemTime(new Date('2025-09-01T00:00:00.000Z'));
    const sameDate = new Date('2025-08-15T10:00:00.000Z');
    const { notification } = applyTimeFrameRules(sameDate, sameDate);

    expect(notification).toBeNull();
  });

  test('should return a warning and cap the "To" date if it exceeds the 3-month max range', () => {
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const fromDate = new Date('2025-05-15T10:00:00.000Z');
    const toDate = new Date('2025-08-16T10:00:00.000Z');
    const { correctedTo, notification } = applyTimeFrameRules(fromDate, toDate);

    expect(notification?.kind).toEqual('warning');
    expect(notification?.text).toContain('Date range cannot exceed 3 months');

    const maxToDate = addMonths(fromDate, 3);
    expect(correctedTo.toISOString()).toEqual(maxToDate.toISOString());
  });
});