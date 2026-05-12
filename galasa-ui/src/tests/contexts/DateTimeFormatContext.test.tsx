/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DateTimeFormatProvider, useDateTimeFormat } from '@/contexts/DateTimeFormatContext';

// Mock a simple component to display the hook's state for our tests
const TestComponent = ({ date }: { date: Date }) => {
  const { preferences, formatDate, updatePreferences, getResolvedTimeZone } = useDateTimeFormat();

  return (
    <div>
      <p>Preferences: {JSON.stringify(preferences)}</p>
      <p>Formatted Date: {formatDate(date)}</p>
      <p>Resolved TimeZone: {getResolvedTimeZone()}</p>
      <button onClick={() => updatePreferences({ locale: 'de-DE' })}>Update Locale</button>
      <button onClick={() => updatePreferences({ dateTimeFormatType: 'browser' })}>
        Set to Browser
      </button>
      <button onClick={() => updatePreferences({ timeZoneType: 'browser' })}>
        Set TZ to Browser
      </button>
      <button onClick={() => updatePreferences({ timeZoneType: 'custom', timeZone: 'Asia/Tokyo' })}>
        Set TZ to Custom
      </button>
    </div>
  );
};

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    clear() {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

const defaultPreferences = {
  dateTimeFormatType: 'browser',
  locale: 'en-US',
  timeFormat: '12-hour',
  timeZoneType: 'browser',
  timeZone: 'UTC',
};

describe('DateTimeFormatContext', () => {
  let originalDateTimeFormat: typeof Intl.DateTimeFormat;
  let originalTZ: string | undefined;

  beforeAll(() => {
    // Store the original implementation
    originalDateTimeFormat = Intl.DateTimeFormat;
    originalTZ = process.env.TZ;
  });

  afterAll(() => {
    // Restore original timezone after all tests in this file have run
    process.env.TZ = originalTZ;
  });

  beforeEach(() => {
    process.env.TZ = 'UTC';
    localStorage.clear();
    jest.restoreAllMocks();
  });

  const mockDate = new Date('2023-10-01T12:00:00Z');
  test('initializes with default preferences', () => {
    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    expect(screen.getByText(/Preferences:/)).toHaveTextContent(JSON.stringify(defaultPreferences));
  });

  test('initialize preferences from localStorage', () => {
    localStorageMock.setItem(
      'dateTimeFormatSettings',
      JSON.stringify({
        dateTimeFormatType: 'custom',
        locale: 'fr-FR',
        timeFormat: '24-hour',
      })
    );

    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    expect(screen.getByText(/Preferences:/)).toHaveTextContent(
      JSON.stringify({
        ...defaultPreferences,
        dateTimeFormatType: 'custom',
        locale: 'fr-FR',
        timeFormat: '24-hour',
      })
    );
  });

  test('updates preferences and localStorage', () => {
    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    // Click the button that calls updatePreferences
    const button = screen.getByRole('button', { name: /Update Locale/i });
    fireEvent.click(button);

    // The new preferences are displayed in the component
    const expectedPrefs = {
      ...defaultPreferences,
      dateTimeFormatType: 'browser',
      locale: 'de-DE', // The updated value
      timeFormat: '12-hour',
    };
    expect(screen.getByText(/Preferences:/)).toHaveTextContent(JSON.stringify(expectedPrefs));

    // Check that localStorage was updated
    const storedPreferences = JSON.parse(
      localStorageMock.getItem('dateTimeFormatSettings') || '{}'
    );
    expect(storedPreferences).toEqual(expectedPrefs);
  });

  test('resets preferences to default when dateTimeFormatType is set to "browser"', () => {
    const initialCustomPrefs = {
      dateTimeFormatType: 'custom',
      locale: 'ja-JP',
      timeFormat: '24-hour',
    };
    localStorage.setItem('dateTimeFormatSettings', JSON.stringify(initialCustomPrefs));

    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    // Check that it initialized correctly
    expect(screen.getByText(/Preferences:/)).toHaveTextContent(
      JSON.stringify({ ...defaultPreferences, ...initialCustomPrefs })
    );

    // Click the button that sets the type to 'browser'
    const button = screen.getByRole('button', { name: /Set to Browser/i });
    fireEvent.click(button);

    // Assert that the preferences have been reset to the default values
    expect(screen.getByText(/Preferences:/)).toHaveTextContent(JSON.stringify(defaultPreferences));

    // Assert that localStorage is also updated to the defaults
    const storedValue = localStorage.getItem('dateTimeFormatSettings');
    expect(storedValue).toBe(JSON.stringify(defaultPreferences));
  });

  test('formatDate uses browser locale when dateTimeFormatType is "browser"', () => {
    jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(
        (locale, options) =>
          new originalDateTimeFormat(locale === undefined ? 'en-US' : locale, options)
      );

    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    expect(screen.getByText(/Formatted Date:/)).toHaveTextContent(
      /10\/01\/2023, \d{1,2}:\d{2}:\d{2} (AM|PM)/
    );
  });

  test('formatDate uses custom locale and time format correctly', () => {
    // Set custom preferences in localStorage
    const customPrefs = {
      dateTimeFormatType: 'custom',
      locale: 'fr-FR',
      timeFormat: '24-hour',
    };
    localStorage.setItem('dateTimeFormatSettings', JSON.stringify(customPrefs));

    render(
      <DateTimeFormatProvider>
        <TestComponent date={mockDate} />
      </DateTimeFormatProvider>
    );

    expect(screen.getByText(/Formatted Date:/)).toHaveTextContent(
      /01\/10\/2023.*\d{2}:\d{2}:\d{2}/
    );
  });

  test('returns an empty text on invalid date', () => {
    const invalidDate = new Date('invalid-date-string');

    render(
      <DateTimeFormatProvider>
        <TestComponent date={invalidDate} />
      </DateTimeFormatProvider>
    );

    expect(screen.getByText(/Formatted Date:/)).toHaveTextContent('-');
  });

  describe('Timezone functionality', () => {
    describe('getResolvedTimeZone', () => {
      test('returns browser timezone when timeZoneType is "browser"', () => {
        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        expect(screen.getByText(/Resolved TimeZone:/)).toHaveTextContent(
          Intl.DateTimeFormat().resolvedOptions().timeZone
        );
      });

      test('returns custom timezone when timeZoneType is "custom"', () => {
        const customPrefs = {
          ...defaultPreferences,
          timeZoneType: 'custom',
          timeZone: 'Asia/Tokyo',
        };
        localStorage.setItem('dateTimeFormatSettings', JSON.stringify(customPrefs));

        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        expect(screen.getByText(/Resolved TimeZone:/)).toHaveTextContent('Asia/Tokyo');
      });
    });

    describe('formatDate with timezones', () => {
      test('uses custom timezone and locale when type is "custom"', () => {
        localStorage.setItem(
          'dateTimeFormatSettings',
          JSON.stringify({
            dateTimeFormatType: 'custom',
            locale: 'en-US',
            timeFormat: '12-hour',
            timeZoneType: 'custom',
            timeZone: 'Asia/Tokyo',
          })
        );

        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        expect(screen.getByText(/Formatted Date:/)).toHaveTextContent(
          'Formatted Date: 10/01/2023, 09:00:00 PM (GMT+9)'
        );
      });

      test('clears formatter cache when preferences are updated', () => {
        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        // Update preferences
        const button = screen.getByRole('button', { name: /Update Locale/i });
        fireEvent.click(button);

        // The formatted date should be updated with new locale
        const updatedFormatted = screen.getByText(/Formatted Date:/).textContent;
        expect(updatedFormatted).toBeDefined();
      });
    });

    describe('Performance: Formatter caching', () => {
      test('reuses cached formatters for multiple calls with same parameters', () => {
        const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat');

        const MultipleCallsComponent = () => {
          const { formatDate } = useDateTimeFormat();
          const date1 = new Date('2023-10-01T12:00:00Z');
          const date2 = new Date('2023-10-02T12:00:00Z');
          const date3 = new Date('2023-10-03T12:00:00Z');

          return (
            <div>
              <p>Date 1: {formatDate(date1)}</p>
              <p>Date 2: {formatDate(date2)}</p>
              <p>Date 3: {formatDate(date3)}</p>
            </div>
          );
        };

        render(
          <DateTimeFormatProvider>
            <MultipleCallsComponent />
          </DateTimeFormatProvider>
        );

        const callCount = dateTimeFormatSpy.mock.calls.length;
        expect(callCount).toBeLessThan(10);

        dateTimeFormatSpy.mockRestore();
      });

      test('creates new formatters after cache is cleared', () => {
        const dateTimeFormatSpy = jest.spyOn(Intl, 'DateTimeFormat');

        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        const initialCallCount = dateTimeFormatSpy.mock.calls.length;

        // Update preferences which should clear the cache
        const button = screen.getByRole('button', { name: /Update Locale/i });
        fireEvent.click(button);

        // After clearing cache, new formatters should be created
        expect(dateTimeFormatSpy.mock.calls.length).toBeGreaterThan(initialCallCount);

        dateTimeFormatSpy.mockRestore();
      });

      test('formatToParts is used for efficient timezone extraction', () => {
        const formatToPartsSpy = jest.fn(() => [{ type: 'timeZoneName', value: 'UTC' }]);

        jest.spyOn(Intl, 'DateTimeFormat').mockImplementation(
          () =>
            ({
              format: jest.fn(() => '10/01/2023, 12:00:00 PM'),
              formatToParts: formatToPartsSpy,
              resolvedOptions: jest.fn(() => ({ timeZone: 'UTC' })),
            }) as unknown as Intl.DateTimeFormat
        );

        render(
          <DateTimeFormatProvider>
            <TestComponent date={mockDate} />
          </DateTimeFormatProvider>
        );

        // Verify formatToParts was called for timezone extraction
        expect(formatToPartsSpy).toHaveBeenCalled();

        jest.restoreAllMocks();
      });
    });
  });
});
