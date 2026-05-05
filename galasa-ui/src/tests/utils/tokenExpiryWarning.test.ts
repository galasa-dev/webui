/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { getValidatedWarningDays, fetchTokenExpiryWarningConfiguration } from '@/utils/tokenExpiryWarning';
import { ConfigurationPropertyStoreAPIApi } from '@/generated/galasaapi';
import * as Constants from '@/utils/constants/common';

describe('tokenExpiryWarning utilities', () => {
  describe('getValidatedWarningDays', () => {
    const DEFAULT_WARNING_DAYS = Constants.DEFAULT_ACCESS_TOKEN_EXPIRY_WARNING_DAYS;
    const MAX_WARNING_DAYS = Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS;

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

    it('returns exact value when input equals maximum', () => {
      const result = getValidatedWarningDays(String(MAX_WARNING_DAYS));
      expect(result.warningDays).toBe(MAX_WARNING_DAYS);
      expect(result.exceededMaximum).toBe(false);
    });
  });

  describe('fetchTokenExpiryWarningConfiguration', () => {
    let mockCpsApiClient: jest.Mocked<ConfigurationPropertyStoreAPIApi>;

    beforeEach(() => {
      mockCpsApiClient = {
        getCpsProperty: jest.fn(),
      } as any;
    });

    it('returns validated warning days from API response', async () => {
      mockCpsApiClient.getCpsProperty.mockResolvedValue([
        { data: { value: '25' } },
      ] as any);

      const result = await fetchTokenExpiryWarningConfiguration(mockCpsApiClient);

      expect(result.warningDays).toBe(25);
      expect(result.exceededMaximum).toBe(false);
      expect(mockCpsApiClient.getCpsProperty).toHaveBeenCalledWith(
        Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAMESPACE,
        Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAME
      );
    });

    it('returns default value when API returns invalid data', async () => {
      mockCpsApiClient.getCpsProperty.mockResolvedValue([
        { data: { value: 'invalid' } },
      ] as any);

      const result = await fetchTokenExpiryWarningConfiguration(mockCpsApiClient);

      expect(result.warningDays).toBe(Constants.DEFAULT_ACCESS_TOKEN_EXPIRY_WARNING_DAYS);
      expect(result.exceededMaximum).toBe(false);
    });

    it('returns default value when API call fails', async () => {
      mockCpsApiClient.getCpsProperty.mockRejectedValue(new Error('API Error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await fetchTokenExpiryWarningConfiguration(mockCpsApiClient);

      expect(result.warningDays).toBe(Constants.DEFAULT_ACCESS_TOKEN_EXPIRY_WARNING_DAYS);
      expect(result.exceededMaximum).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch token expiry warning configuration, using defaults:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('caps value at maximum and sets exceededMaximum flag', async () => {
      mockCpsApiClient.getCpsProperty.mockResolvedValue([
        { data: { value: '100' } },
      ] as any);

      const result = await fetchTokenExpiryWarningConfiguration(mockCpsApiClient);

      expect(result.warningDays).toBe(Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS);
      expect(result.exceededMaximum).toBe(true);
    });
  });
});
