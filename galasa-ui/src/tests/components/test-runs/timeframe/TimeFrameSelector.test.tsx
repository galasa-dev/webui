/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TimeFrameSelector from '@/components/test-runs/timeframe/TimeFrameSelector';
import { TimeFrameValues } from '@/utils/interfaces';
import { useState } from 'react';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      selectEnvelope: 'Select an envelope',
      envelopeDescription: 'Description',
      from: 'From',
      to: 'To',
      durationTitle: 'Duration before {boldTo} time',
      boldTo: 'To',
      specificTimeTitle: 'A specific time',
      nowTitle: 'Now',
      nowDescription: 'The time the query results are viewed or refreshed',
      invalidTimeFrame: 'Invalid Time Frame',
      autoCorrection: 'Auto-Correction',
      toBeforeFromErrorMessage: "'To' date cannot be before 'From' date.",
      toBeforeFromWarningOnly: "'From' time is set to the future.",
    };
    return translations[key] || key;
  },
}));

// Mock DateTimeFormatContext
jest.mock('@/contexts/DateTimeFormatContext', () => ({
  useDateTimeFormat: () => ({
    getResolvedTimeZone: () => 'UTC',
  }),
}));

// Mock DurationFilter
jest.mock('@/components/test-runs/timeframe/DurationFilter', () => {
  return function DurationFilterMock({ disabled }: { disabled: boolean }) {
    return (
      <div data-testid="duration-filter" data-disabled={disabled}>
        Duration Filter
      </div>
    );
  };
});

// Mock DateTimePicker
jest.mock('@/components/test-runs/timeframe/DateTimePicker', () => {
  return function DateTimePickerMock({
    disabled,
    prefixId,
  }: {
    disabled: boolean;
    prefixId: string;
  }) {
    return (
      <div data-testid={`date-time-picker-${prefixId}`} data-disabled={disabled}>
        DateTimePicker {prefixId}
      </div>
    );
  };
});

describe('TimeFrameSelector - Radio Button State Tests', () => {
  const createMockValues = (overrides?: Partial<TimeFrameValues>): TimeFrameValues => ({
    fromDate: new Date('2023-01-01T00:00:00.000Z'),
    fromTime: '12:00',
    fromAmPm: 'AM',
    toDate: new Date('2023-01-02T00:00:00.000Z'),
    toTime: '12:00',
    toAmPm: 'PM',
    durationDays: 1,
    durationHours: 0,
    durationMinutes: 0,
    isRelativeToNow: false,
    fromSelectionType: 'duration',
    toSelectionType: 'now',
    ...overrides,
  });

  test('radio buttons reflect duration + specific to state on load', () => {
    const mockValues = createMockValues({
      fromSelectionType: 'duration',
      toSelectionType: 'specificTime',
      isRelativeToNow: false,
    });
    const mockSetValues = jest.fn();

    render(<TimeFrameSelector values={mockValues} setValues={mockSetValues} />);

    // Check From radio buttons
    const durationRadio = screen.getByRole('radio', { name: /Duration before/i });
    const allSpecificTimeRadios = screen.getAllByRole('radio', { name: 'A specific time' });
    const specificFromRadio = allSpecificTimeRadios[0]; // First one is for From
    expect(durationRadio).toBeChecked();
    expect(specificFromRadio).not.toBeChecked();

    // Check To radio buttons
    const nowRadio = screen.getByRole('radio', { name: 'Now' });
    const specificToRadio = allSpecificTimeRadios[1]; // Second one is for To
    expect(nowRadio).not.toBeChecked();
    expect(specificToRadio).toBeChecked();
  });

  test('radio buttons reflect specific from + now state on load', () => {
    const mockValues = createMockValues({
      fromSelectionType: 'specificTime',
      toSelectionType: 'now',
      isRelativeToNow: true,
    });
    const mockSetValues = jest.fn();

    render(<TimeFrameSelector values={mockValues} setValues={mockSetValues} />);

    // Check From radio buttons
    const durationRadio = screen.getByRole('radio', { name: /Duration before/i });
    const allSpecificTimeRadios = screen.getAllByRole('radio', { name: 'A specific time' });
    const specificFromRadio = allSpecificTimeRadios[0]; // First one is for From
    expect(durationRadio).not.toBeChecked();
    expect(specificFromRadio).toBeChecked();

    // Check To radio buttons
    const nowRadio = screen.getByRole('radio', { name: 'Now' });
    const specificToRadio = allSpecificTimeRadios[1]; // Second one is for To
    expect(nowRadio).toBeChecked();
    expect(specificToRadio).not.toBeChecked();
  });

  test('switching between queries updates radio button state correctly', () => {
    const TestWrapper = () => {
      const [queryState, setQueryState] = useState<'queryA' | 'queryB'>('queryA');
      const [values, setValues] = useState<TimeFrameValues>(() =>
        createMockValues({
          fromSelectionType: 'duration',
          toSelectionType: 'now',
          isRelativeToNow: true,
        })
      );

      const switchToQueryB = () => {
        setQueryState('queryB');
        setValues(
          createMockValues({
            fromSelectionType: 'specificTime',
            toSelectionType: 'specificTime',
            isRelativeToNow: false,
          })
        );
      };

      const switchToQueryA = () => {
        setQueryState('queryA');
        setValues(
          createMockValues({
            fromSelectionType: 'duration',
            toSelectionType: 'now',
            isRelativeToNow: true,
          })
        );
      };

      return (
        <div>
          <button onClick={switchToQueryB}>Load Query B</button>
          <button onClick={switchToQueryA}>Load Query A</button>
          <p>Current Query: {queryState}</p>
          <TimeFrameSelector values={values} setValues={setValues} />
        </div>
      );
    };

    render(<TestWrapper />);

    // Initial state: Query A (Duration + Now)
    expect(screen.getByText('Current Query: queryA')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Duration before/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Now' })).toBeChecked();

    // Switch to Query B (Specific + Specific)
    fireEvent.click(screen.getByRole('button', { name: 'Load Query B' }));

    expect(screen.getByText('Current Query: queryB')).toBeInTheDocument();
    const allSpecificTimeRadios = screen.getAllByRole('radio', { name: 'A specific time' });
    const specificFromRadio = allSpecificTimeRadios[0];
    const specificToRadio = allSpecificTimeRadios[1];
    expect(specificFromRadio).toBeChecked();
    expect(specificToRadio).toBeChecked();

    // Switch back to Query A
    fireEvent.click(screen.getByRole('button', { name: 'Load Query A' }));

    expect(screen.getByText('Current Query: queryA')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Duration before/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Now' })).toBeChecked();
  });

  test('changing from radio button updates state correctly', async () => {
    const mockValues = createMockValues({
      fromSelectionType: 'duration',
      toSelectionType: 'now',
      isRelativeToNow: true,
    });
    const mockSetValues = jest.fn();

    render(<TimeFrameSelector values={mockValues} setValues={mockSetValues} />);

    // Click on Specific Time for From (first one)
    const allSpecificTimeRadios = screen.getAllByRole('radio', { name: 'A specific time' });
    const specificFromRadio = allSpecificTimeRadios[0];
    fireEvent.click(specificFromRadio);

    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalled();
    });

    // Check that setValues was called with fromSelectionType: 'specificTime'
    const lastCall = mockSetValues.mock.calls[mockSetValues.mock.calls.length - 1][0];
    if (typeof lastCall === 'function') {
      const result = lastCall(mockValues);
      expect(result.fromSelectionType).toBe('specificTime');
      expect(result.toSelectionType).toBe('now');
    }
  });

  test('changing to radio button updates state correctly', async () => {
    const mockValues = createMockValues({
      fromSelectionType: 'duration',
      toSelectionType: 'specificTime',
      isRelativeToNow: false,
    });
    const mockSetValues = jest.fn();

    render(<TimeFrameSelector values={mockValues} setValues={mockSetValues} />);

    // Click on Now for To
    const nowRadio = screen.getByRole('radio', { name: 'Now' });
    fireEvent.click(nowRadio);

    await waitFor(() => {
      expect(mockSetValues).toHaveBeenCalled();
    });

    // Check that setValues was called with toSelectionType: 'now'
    const lastCall = mockSetValues.mock.calls[mockSetValues.mock.calls.length - 1][0];
    if (typeof lastCall === 'function') {
      const result = lastCall(mockValues);
      expect(result.fromSelectionType).toBe('duration');
      expect(result.toSelectionType).toBe('now');
      expect(result.isRelativeToNow).toBe(true);
    }
  });

  // Additional test: Verify disabled state propagates to child components
  test('disabled state propagates correctly based on radio selection', () => {
    const mockValues = createMockValues({
      fromSelectionType: 'duration',
      toSelectionType: 'now',
    });
    const mockSetValues = jest.fn();

    render(<TimeFrameSelector values={mockValues} setValues={mockSetValues} />);

    // Duration filter should be enabled, from date-time picker should be disabled
    const durationFilter = screen.getByTestId('duration-filter');
    const fromDateTimePicker = screen.getByTestId('date-time-picker-from');
    const toDateTimePicker = screen.getByTestId('date-time-picker-to');

    expect(durationFilter).toHaveAttribute('data-disabled', 'false');
    expect(fromDateTimePicker).toHaveAttribute('data-disabled', 'true');
    expect(toDateTimePicker).toHaveAttribute('data-disabled', 'true'); // Now is selected
  });
});
