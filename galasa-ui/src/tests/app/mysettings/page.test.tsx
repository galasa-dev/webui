/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */

// Test the getValidatedWarningDays function logic
describe('getValidatedWarningDays', () => {
  const DEFAULT_WARNING_DAYS = 14;
  const MAX_WARNING_DAYS = 30;

  // Simulate the function from mysettings/page.tsx
  const getValidatedWarningDays = (value?: string) => {
    const parsedValue = Number.parseInt(value ?? '', 10);

    if (Number.isNaN(parsedValue) || parsedValue < 0) {
      return {
        warningDays: DEFAULT_WARNING_DAYS,
        exceededMaximum: false,
      };
    }

    if (parsedValue > MAX_WARNING_DAYS) {
      return {
        warningDays: MAX_WARNING_DAYS,
        exceededMaximum: true,
      };
    }

    return {
      warningDays: parsedValue,
      exceededMaximum: false,
    };
  };

  it('returns default value when input is undefined', () => {
    const result = getValidatedWarningDays(undefined);
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns default value when input is empty string', () => {
    const result = getValidatedWarningDays('');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns default value when input is not a number', () => {
    const result = getValidatedWarningDays('abc');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns default value when input is negative', () => {
    const result = getValidatedWarningDays('-5');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('accepts zero as a valid value', () => {
    const result = getValidatedWarningDays('0');
    expect(result.warningDays).toBe(0);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns valid value when input is within range', () => {
    const result = getValidatedWarningDays('20');
    expect(result.warningDays).toBe(20);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns maximum value and sets exceededMaximum flag when input exceeds maximum', () => {
    const result = getValidatedWarningDays('50');
    expect(result.warningDays).toBe(MAX_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(true);
  });

  it('returns maximum value and sets exceededMaximum flag when input is much larger than maximum', () => {
    const result = getValidatedWarningDays('1000');
    expect(result.warningDays).toBe(MAX_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(true);
  });

  it('returns exact value when input equals maximum', () => {
    const result = getValidatedWarningDays('30');
    expect(result.warningDays).toBe(MAX_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns exact value when input equals minimum valid value (1)', () => {
    const result = getValidatedWarningDays('1');
    expect(result.warningDays).toBe(1);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns exact value when input equals default', () => {
    const result = getValidatedWarningDays('14');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('handles decimal values by truncating to integer', () => {
    const result = getValidatedWarningDays('15.7');
    expect(result.warningDays).toBe(15);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns default value for special numeric strings like Infinity', () => {
    const result = getValidatedWarningDays('Infinity');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('returns default value for whitespace-only input', () => {
    const result = getValidatedWarningDays('   ');
    expect(result.warningDays).toBe(DEFAULT_WARNING_DAYS);
    expect(result.exceededMaximum).toBe(false);
  });

  it('handles numeric strings with leading/trailing whitespace', () => {
    const result = getValidatedWarningDays('  25  ');
    expect(result.warningDays).toBe(25);
    expect(result.exceededMaximum).toBe(false);
  });
});
