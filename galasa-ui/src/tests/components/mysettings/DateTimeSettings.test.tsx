/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import DateTimeSettings from '@/components/mysettings/DateTimeSettings';
import { render, screen } from '@testing-library/react';

// Mock the next-intl module to provide translations
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Date and Time Settings',
    };
    return translations[key] || key;
  },
}));

// Mock components
jest.mock('@/components/mysettings/FormatSection', () => {
  return function MockedFormatSection() {
    return <div>Mocked Format Section</div>;
  };
});

jest.mock('@/components/mysettings/TimezoneSection', () => {
  return function MockedTimezoneSection() {
    return <div>Mocked Timezone Section</div>;
  };
});

describe('DateTimeSettings', () => {
  test('Renders without crashing', () => {
    const { container } = render(<DateTimeSettings />);
    expect(container).toBeInTheDocument();
  });

  test('Displays the title correctly', () => {
    render(<DateTimeSettings />);
    const title = screen.getByText(/Date and Time Settings/i);
    expect(title).toBeInTheDocument();
  });

  test('Contains FormatSection and TimezoneSection components', () => {
    render(<DateTimeSettings />);
    expect(screen.getByText(/Mocked Format Section/i)).toBeInTheDocument();
    expect(screen.getByText(/Mocked Timezone Section/i)).toBeInTheDocument();
  });
});
