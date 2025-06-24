/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TimeFrameContent, { applyTimeFrameRules, calculateSynchronizedState } from '@/components/test-runs/TimeFrameContent';
import { addMonths } from '@/utils/timeOperations';
import { DAY_MS } from '@/utils/constants/common';

// Mock next-intl to prevent ESM parsing errors in Jest
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      toBeforeFrom: "'To' date cannot be before 'From' date.",
      dateRangeCapped: "Date range was capped at the current time.",
      dateRangeExceeded: "Date range cannot exceed 3 months; 'To' date has been adjusted.",
      invalidTimeFrame: 'Invalid Time Frame',
      autoCorrection: 'Auto-Correction',
    };
    return translations[key] || key;
  },
}));

const mockTranslator = (key: string, values?: Record<string, any>) => {
  if (key === 'toBeforeFrom') return "'To' date cannot be before 'From' date.";
  if (key === 'dateRangeCapped') return "Date range was capped at the current time.";
  if (key === 'dateRangeExceeded' && values) {
    return `Date range cannot exceed ${values.maxMonths} months; 'To' date has been adjusted.`;
  }
  return key; 
};

// Mock the child component to prevent its internal logic from running
jest.mock('@/components/test-runs/TimeFrameFilter', () => {
  const TimeFrameFilterMock = (props: any) => (
    <div data-testid="timeframe-filter">
      <label htmlFor="from-date">From Date</label>
      <input
        id="from-date"
        value={props.values.fromDate.toLocaleDateString('en-US')}
        onChange={(e) =>
          props.handleValueChange('fromDate', new Date(e.target.value))
        }
      />
      <label htmlFor="duration-days">Days</label>
      <input
        type="number"
        id="duration-days"
        value={props.values.durationDays}
        onChange={(e) =>
          props.handleValueChange('durationDays', parseInt(e.target.value, 10))
        }
      />
      <label htmlFor="duration-hours">Hours</label>
      <input
        type="number"
        id="duration-hours"
        value={props.values.durationHours}
        onChange={(e) =>
          props.handleValueChange('durationHours', parseInt(e.target.value, 10))
        }
      />
      <label htmlFor="to-date">To Date</label>
      <input
        id="to-date"
        value={props.values.toDate.toLocaleDateString('en-US')}
        onChange={(e) =>
          props.handleValueChange('toDate', new Date(e.target.value))
        }
      />
    </div>
  );

  return TimeFrameFilterMock;
});


// Mock next/navigation hooks
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/test-runs',
}));

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
    const { notification, correctedTo } = applyTimeFrameRules(fromDate, toDate, mockTranslator);

    expect(notification).toBeNull();
    expect(correctedTo).toEqual(toDate);
  });

  test('should return null notification if "To" date is exactly "now"', () => {
    jest.setSystemTime(MOCK_NOW);
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const { notification } = applyTimeFrameRules(fromDate, MOCK_NOW, mockTranslator);

    expect(notification).toBeNull();
  });

  test('should return a warning and cap the "To" date if it is in the future', () => {
    jest.setSystemTime(MOCK_NOW);
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    // Set a date 5 minutes into the future from our mocked "now"
    const futureDate = new Date(MOCK_NOW.getTime() + 5 * 60 * 1000);
    const { correctedTo, notification } = applyTimeFrameRules(fromDate, futureDate, mockTranslator);

    expect(notification?.kind).toEqual('warning');
    expect(notification?.text).toEqual('Date range was capped at the current time.');
    // Ensure the date is capped exactly to our mocked "now"
    expect(correctedTo.toISOString()).toEqual(MOCK_NOW.toISOString());
  });

  test('should return an error if "From" date is after "To" date', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-14T10:00:00.000Z'); 
    const { correctedFrom, correctedTo, notification } = applyTimeFrameRules(fromDate, toDate, mockTranslator);

    expect(notification?.kind).toEqual('error');
    expect(notification?.text).toEqual("'To' date cannot be before 'From' date.");
       
    // Ensure dates are not modified on a hard error
    expect(correctedFrom).toEqual(fromDate);
    expect(correctedTo).toEqual(toDate);
  });

  test('should return null notification if "From" and "To" dates are the same', () => {
    jest.setSystemTime(new Date('2025-09-01T00:00:00.000Z'));
    const sameDate = new Date('2025-08-15T10:00:00.000Z');
    const { notification } = applyTimeFrameRules(sameDate, sameDate, mockTranslator);

    expect(notification).toBeNull();
  });

  test('should return a warning and cap the "To" date if it exceeds the 3-month max range', () => {
    jest.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

    const fromDate = new Date('2025-05-15T10:00:00.000Z');
    const toDate = new Date('2025-08-16T10:00:00.000Z');
    const { correctedTo, notification } = applyTimeFrameRules(fromDate, toDate, mockTranslator);
    
    expect(notification?.kind).toEqual('warning');
    expect(notification?.text).toContain('Date range cannot exceed 3 months');

    const maxToDate = addMonths(fromDate, 3);
    expect(correctedTo.toISOString()).toEqual(maxToDate.toISOString());
  });
});

describe('calculateSynchronizedState', () => {
  test('should correctly calculate a duration of excactly 1 day', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-16T10:00:00.000Z');
    const { durationDays, durationHours, durationMinutes } = calculateSynchronizedState(fromDate, toDate);

    expect(durationDays).toBe(1);
    expect(durationHours).toBe(0);
    expect(durationMinutes).toBe(0);
  });

  test('should correctly calculate a complex duration of 2 days, 5 hours and 15 minutes', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-17T15:15:00.000Z');
    const { durationDays, durationHours, durationMinutes } = calculateSynchronizedState(fromDate, toDate);

    expect(durationDays).toBe(2);
    expect(durationHours).toBe(5);
    expect(durationMinutes).toBe(15);
  });

  test('should handle a zero duration when "From" and "To" dates are the same', () => {
    const sameDate = new Date('2025-08-15T10:00:00.000Z');
    const { durationDays, durationHours, durationMinutes } = calculateSynchronizedState(sameDate, sameDate);

    expect(durationDays).toBe(0);
    expect(durationHours).toBe(0);
    expect(durationMinutes).toBe(0);
  });

  test('should handle a negative duration by returning zero values', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-14T10:00:00.000Z'); // One day before
    const { durationDays, durationHours, durationMinutes } = calculateSynchronizedState(fromDate, toDate);

    expect(durationDays).toBe(0);
    expect(durationHours).toBe(0);
    expect(durationMinutes).toBe(0);
  });

  test('should handle a duration of less than a minute', () => {
    const fromDate = new Date('2025-08-15T10:00:00.000Z');
    const toDate = new Date('2025-08-15T10:00:30.000Z'); // 30 seconds later
    const { durationDays, durationHours, durationMinutes } = calculateSynchronizedState(fromDate, toDate);

    expect(durationDays).toBe(0);
    expect(durationHours).toBe(0);
    expect(durationMinutes).toBe(0);
  });

  test('should corrrectly extract time parts for "From" and "To" dates', () => {
    const fromDate = new Date('2025-08-15T10:30:00.000');
    const toDate = new Date('2025-08-15T12:45:00.000');
    const { fromTime, fromAmPm, toTime, toAmPm } = calculateSynchronizedState(fromDate, toDate);

    expect(fromTime).toBe('10:30');
    expect(fromAmPm).toBe('AM');
    expect(toTime).toBe('12:45');
    expect(toAmPm).toBe('PM');
  });
});

describe('TimeFrameContent Tests', () => {
  const MOCK_NOW = new Date('2025-08-20T12:00:00.000Z');

  beforeEach(() => {
    // Reset mocks and timers before each test
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_NOW);
    mockReplace.mockClear();
    mockSearchParams = new URLSearchParams();
  });

  afterEach(() => {
    jest.useRealTimers();
  });


  test('should render correctly and initialize its state from defaults', () => {
    render(<TimeFrameContent />);

    const expectedToDate = MOCK_NOW;
    const expectedFromDate = new Date(expectedToDate.getTime() - DAY_MS); // 1 day before

    expect(screen.getByLabelText('To Date')).toHaveValue(expectedToDate.toLocaleDateString('en-US'));
    expect(screen.getByLabelText('From Date')).toHaveValue(expectedFromDate.toLocaleDateString('en-US'));

    expect(screen.getByLabelText('Days')).toHaveValue(1);
    expect(screen.getByLabelText('Hours')).toHaveValue(0);
  });

  test('should initialize state from URL search params if they exists', () => {
    const fromDateString = '2025-08-15T10:00:00.000Z';
    const toDateString = '2025-08-17T10:00:00.000Z';
    mockSearchParams.set('from', fromDateString);
    mockSearchParams.set('to', toDateString);

    render(<TimeFrameContent />);

    const expectedFromDate = new Date(fromDateString);
    const expectedToDate = new Date(toDateString);

    expect(screen.getByLabelText('From Date')).toHaveValue(expectedFromDate.toLocaleDateString('en-US'));
    expect(screen.getByLabelText('To Date')).toHaveValue(expectedToDate.toLocaleDateString('en-US'));
    expect(screen.getByLabelText('Days')).toHaveValue(2);
    expect(screen.getByLabelText('Hours')).toHaveValue(0);
  });

  test('should update the `To` date when the duration is increased', async () => {
    const initialFromDate = new Date('2025-08-15T12:00:00.000Z');
    const initialToDate = new Date(initialFromDate.getTime() + DAY_MS); 
    mockSearchParams.set('from', initialFromDate.toISOString());
    mockSearchParams.set('to', initialToDate.toISOString());

    render(<TimeFrameContent />);

    const daysInput = screen.getByLabelText('Days');
    expect(daysInput).toHaveValue(1); 

    // Change the duration to 3 days
    fireEvent.change(daysInput, { target: { value: '3' } });

    await waitFor(() => {
      const expectedToDate = new Date(initialFromDate.getTime() + 3 * DAY_MS); // 3 days total

      expect(screen.getByLabelText('To Date')).toHaveValue(expectedToDate.toLocaleDateString('en-US'));
    });

    // Change the duration to 5 hours
    const hoursInput = screen.getByLabelText('Hours');
    fireEvent.change(hoursInput, { target: { value: '5' } });

    await waitFor(() => {
      const expectedToDate = new Date(initialFromDate.getTime() + 3 * DAY_MS + 5 * 60 * 60 * 1000); // 3 days and 5 hours total
      expect(screen.getByLabelText('To Date')).toHaveValue(expectedToDate.toLocaleDateString('en-US'));
    });
  });

  test('should update the duration when the `To` date or `From` date is changed', async () => {
    render(<TimeFrameContent />);

    const fromDateInput = screen.getByLabelText('From Date');
    const toDateInput = screen.getByLabelText('To Date');
    const daysInput = screen.getByLabelText('Days');

    fireEvent.change(fromDateInput, { target: { value: '2025-08-12' } });
    fireEvent.change(toDateInput, { target: { value: '2025-08-15' } });

    expect(daysInput).toHaveValue(3); // Default duration is 1 day

    // Change the to date to 2 days later
    fireEvent.change(toDateInput, { target: { value: '2025-08-17' } });
    await waitFor(() => {
      expect(daysInput).toHaveValue(5);
    });

    // Change the from date to 1 day later
    fireEvent.change(fromDateInput, { target: { value: '2025-08-13' } });
    await waitFor(() => {
      expect(daysInput).toHaveValue(4); 
    });   
  });

  test('should display an error and not update state if the date range becomes inverted', async () => {
    const initialFrom = '2025-08-10T12:00:00.000Z';
    const initialTo = '2025-08-12T12:00:00.000Z';
    mockSearchParams = new URLSearchParams({
      from: initialFrom,
      to: initialTo,
    });

    render(<TimeFrameContent />);

    const fromDateInput = screen.getByLabelText('From Date');
    const toDateInput = screen.getByLabelText('To Date');
    const daysInput = screen.getByLabelText('Days');

    // Clear previous router calls from initialization
    mockReplace.mockClear();

    // Change "From" date to be after "To" date
    fireEvent.change(fromDateInput, { target: { value: '08/15/2025' } });

    // Check that the error notification is displayed
    const errorNotification = await screen.findByText("'To' date cannot be before 'From' date.");
    expect(errorNotification).toBeInTheDocument();

    // Ensure the router replace was called once on mount
    expect(mockReplace).toHaveBeenCalledTimes(1);

    // Ensure the dates are not modified
    expect(fromDateInput).toHaveValue(new Date(initialFrom).toLocaleDateString('en-US'));
    expect(toDateInput).toHaveValue(new Date(initialTo).toLocaleDateString('en-US'));
    expect(daysInput).toHaveValue(2);
  });

  test('should update the URL search params when dates are changed and valid', async () => {
    const MOCK_INITIAL_FROM = new Date('2025-08-19T12:00:00.000Z');

    render(<TimeFrameContent />);

    // Assert on mount call
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });
    const expectedMountUrl = `/test-runs?from=${encodeURIComponent(MOCK_INITIAL_FROM.toISOString())}&to=${encodeURIComponent(MOCK_NOW.toISOString())}`;
    expect(mockReplace).toHaveBeenCalledWith(expectedMountUrl, { scroll: false });

    // Change the "From" date
    const fromDateInput = screen.getByLabelText('From Date');
    fireEvent.change(fromDateInput, { target: { value: '2025-08-15' } });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(2);
    });

    // Change the "To" date
    const toDateInput = screen.getByLabelText('To Date');
    fireEvent.change(toDateInput, { target: { value: '2025-08-19' } });

    // Assert the final state
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledTimes(3);

      const expectedFinalFrom = new Date('2025-08-15T12:00:00.000Z');
      const expectedFinalTo = new Date('2025-08-19T12:00:00.000Z');

      const expectedParams = new URLSearchParams({
        from: expectedFinalFrom.toISOString(),
        to: expectedFinalTo.toISOString(),
      });
      
      const lastCall = mockReplace.mock.calls[mockReplace.mock.calls.length - 1];
      expect(lastCall[0]).toContain(`?${expectedParams.toString()}`);
    });
  });
});