/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import DateTimeFormatSection from '@/components/mysettings/TimezoneSection';
import TimezoneSection from '@/components/mysettings/TimezoneSection';
import { SUPPORTED_TIMEZONES } from '@/utils/constants/timezones';

// Mock the useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      description: 'Configure which time zone is applied when displaying date and time values.',
      timeZoneFormat: 'Time Zone Format',
      showTimeZoneInBrowser: 'Show time zone based on the browser settings',
      showTimeZoneInCustom: 'Show time zone in a custom format',
      selectTimeZone: 'Select a time zone',
      customTimeZone: 'Custom Time Zone',
      browserTimeZone: 'Browser Time Zone',
    };
    return translations[key] || key;
  },
}));

// Mock the useDateTimeFormat context
const mockUpdatePreferences = jest.fn();
const defaultPreferences = {
  dateTimeFormatType: 'browser',
  locale: 'en-US',
  timeFormat: '12-hour',
  timeZone: 'UTC',
  timeZoneType: 'browser',
};

let mockContextValue = {
  preferences: defaultPreferences,
  updatePreferences: mockUpdatePreferences,
};

jest.mock('@/contexts/DateTimeFormatContext', () => ({
  useDateTimeFormat: () => mockContextValue,
}));

jest.mock('@/utils/constants/timezones', () => ({
  SUPPORTED_TIMEZONES: [
    { iana: 'UTC', label: 'Coordinated Universal Time' },
    { iana: 'America/New_York', label: 'Eastern Time' },
    { iana: 'Europe/London', label: 'London Time' },
    { iana: 'Australia/Perth', label: 'Australian Western Time' },
  ],
}));

describe('TimezoneSection', () => {
  beforeEach(() => {
    // Reset the context value and mock function before each test
    mockContextValue = {
      preferences: defaultPreferences,
      updatePreferences: mockUpdatePreferences,
    };
    mockUpdatePreferences.mockClear();
  });

  test('renders correctly with initial preferences', () => {
    render(<DateTimeFormatSection />);

    expect(
      screen.getByText(
        /Configure which time zone is applied when displaying date and time values./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Show time zone based on the browser settings/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Show time zone in a custom format/i)).toBeInTheDocument();
    expect(screen.getByText(/Select a time zone/i)).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /browser/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /custom/i })).not.toBeChecked();

    // Assert that the custom locale dropdown is disabled
    const dropdownWrapper = screen.getByTestId('custom-timezone-dropdown-test');
    const localeDropdown = within(dropdownWrapper).getByRole('combobox');
    expect(localeDropdown).toBeDisabled();
  });

  test('enables custom locale dropdown when custom timeZoneType is selected', () => {
    const { rerender } = render(<TimezoneSection />);

    // Select the custom timeZoneType
    const customRadio = screen.getByRole('radio', { name: /custom/i });
    fireEvent.click(customRadio);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ timeZoneType: 'custom' });
    mockContextValue = {
      ...mockContextValue,
      preferences: {
        ...mockContextValue.preferences,
        timeZoneType: 'custom',
      },
    };

    rerender(<TimezoneSection />);

    // Assert that the custom time zone dropdown is enabled
    const dropdownWrapper = screen.getByTestId('custom-timezone-dropdown-test');
    const timezoneDropdown = within(dropdownWrapper).getByRole('combobox');
    expect(timezoneDropdown).not.toBeDisabled();
  });

  test('updates time zone preferences when a new time zone is selected', () => {
    const { rerender } = render(<TimezoneSection />);

    // Enable the custom dropdown
    fireEvent.click(screen.getByRole('radio', { name: /custom/i }));
    mockContextValue = {
      ...mockContextValue,
      preferences: {
        ...mockContextValue.preferences,
        timeZoneType: 'custom',
      },
    };
    rerender(<TimezoneSection />);
    mockUpdatePreferences.mockClear();

    // Select a new time zone
    const timezoneDropdown = screen.getByTestId('custom-timezone-dropdown-test');
    const timezoneSelect = within(timezoneDropdown).getByRole('combobox');
    fireEvent.click(timezoneSelect);

    const newTimeZone = screen.getByText(SUPPORTED_TIMEZONES[3].label);
    fireEvent.click(newTimeZone);

    // Assert that the updatePreferences function was called with the new time zone
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ timeZone: SUPPORTED_TIMEZONES[3].iana });
  });
});
