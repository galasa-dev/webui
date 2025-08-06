/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import FormatSection from '@/components/mysettings/FormatSection';
import { SUPPORTED_LOCALES } from '@/utils/constants/common';

// Mock the useTranslations hook
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Date/Time Format',
      description: 'Edit date and time format settings.',
      showDatesInBrowserLocale: 'browser',
      showDatesInCustomLocale: 'custom',
      selectLocale: 'Select Locale',
      selectTimeFormat: 'Select Time Format',
    };
    return translations[key] || key;
  },
}));

// Mock the useDateTimeFormat context
const mockUpdatePreferences = jest.fn();
let mockContextValue = {
  preferences: {
    dateTimeFormatType: 'browser',
    locale: 'en-US',
    timeFormat: '12-hour',
  },
  updatePreferences: mockUpdatePreferences,
};

jest.mock('@/contexts/DateTimeFormatContext', () => ({
  useDateTimeFormat: () => mockContextValue,
}));

describe('FormatSection', () => {
  beforeEach(() => {
    // Reset the context value and mock function before each test
    mockContextValue = {
      preferences: {
        dateTimeFormatType: 'browser',
        locale: 'en-US',
        timeFormat: '12-hour',
      },
      updatePreferences: mockUpdatePreferences,
    };
    mockUpdatePreferences.mockClear();
  });

  test('renders correctly with initial preferences', () => {
    render(<FormatSection />);

    expect(screen.getByText(/Edit date and time format settings./i)).toBeInTheDocument();
    expect(screen.getByLabelText(/browser/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/custom/i)).toBeInTheDocument();

    expect(screen.getByRole('radio', { name: /browser/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /custom/i })).not.toBeChecked();

    // Assert that the custom locale dropdown is disabled
    const dropdownWrapper = screen.getByTestId('custom-locale-dropdown-test');
    const localeDropdown = within(dropdownWrapper).getByRole('combobox');
    expect(localeDropdown).toBeDisabled();
  });

  test('enables custom locale dropdown when custom dateTimeFormatType is selected', () => {
    const { rerender } = render(<FormatSection />);

    // Select the custom dateTimeFormatType
    const customRadio = screen.getByRole('radio', { name: /custom/i });
    fireEvent.click(customRadio);

    expect(mockUpdatePreferences).toHaveBeenCalledWith({ dateTimeFormatType: 'custom' });
    mockContextValue = {
      ...mockContextValue,
      preferences: {
        ...mockContextValue.preferences,
        dateTimeFormatType: 'custom',
      },
    };

    rerender(<FormatSection />);

    // Assert that the custom locale dropdown is enabled
    const dropdownWrapper = screen.getByTestId('custom-locale-dropdown-test');
    const localeDropdown = within(dropdownWrapper).getByRole('combobox');
    expect(localeDropdown).not.toBeDisabled();
  });

  test('updates locale preference when a new locale is selected', () => {
    const { rerender } = render(<FormatSection />);

    // Enable the custom dropdowns
    fireEvent.click(screen.getByRole('radio', { name: /custom/i }));
    mockContextValue = {
      ...mockContextValue,
      preferences: {
        ...mockContextValue.preferences,
        dateTimeFormatType: 'custom',
      },
    };
    rerender(<FormatSection />);
    mockUpdatePreferences.mockClear();

    // Select a new locale from the dropdown
    const dropdownWrapper = screen.getByTestId('custom-locale-dropdown-test');
    const localeDropdownButton = within(dropdownWrapper).getByRole('combobox');

    fireEvent.click(localeDropdownButton);

    const frLocale = SUPPORTED_LOCALES.find((l) => l.code === 'fr-FR');
    if (!frLocale) {
      throw new Error('fr-FR locale not found in SUPPORTED_LOCALES');
    }
    const optionText = `${frLocale.code} ${frLocale.format}`;
    fireEvent.click(screen.getByText(optionText));

    // Check that updatePreferences was called with the correct payload
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ locale: 'fr-FR' });
    expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
  });
});
