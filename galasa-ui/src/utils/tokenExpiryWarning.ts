/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { ConfigurationPropertyStoreAPIApi } from '@/generated/galasaapi';
import * as Constants from '@/utils/constants/common';

export interface TokenExpiryWarningResult {
  warningDays: number;
  exceededMaximum: boolean;
}

/**
 * Validates and normalizes the token expiry warning days value.
 * Returns default value if input is invalid, maximum value if exceeded, or the parsed value otherwise.
 * 
 * @param value - The string value to validate and parse
 * @returns An object containing the validated warning days and whether the maximum was exceeded
 */
export const getValidatedWarningDays = (value?: string): TokenExpiryWarningResult => {
  const parsedValue = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return {
      warningDays: Constants.DEFAULT_ACCESS_TOKEN_EXPIRY_WARNING_DAYS,
      exceededMaximum: false,
    };
  }

  if (parsedValue > Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS) {
    return {
      warningDays: Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS,
      exceededMaximum: true,
    };
  }

  return {
    warningDays: parsedValue,
    exceededMaximum: false,
  };
};

/**
 * Fetches the token expiry warning configuration from the CPS API.
 * Falls back to default values if the fetch fails or returns invalid data.
 * 
 * @param cpsApiClient - The ConfigurationPropertyStoreAPIApi client instance
 * @returns A promise resolving to the validated token expiry warning configuration
 */
export const fetchTokenExpiryWarningConfiguration = async (
  cpsApiClient: ConfigurationPropertyStoreAPIApi
): Promise<TokenExpiryWarningResult> => {
  try {
    const warningPropertyResponse = await cpsApiClient.getCpsProperty(
      Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAMESPACE,
      Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAME
    );

    const warningPropertyValue = warningPropertyResponse?.[0]?.data?.value;
    return getValidatedWarningDays(warningPropertyValue);
  } catch (error) {
    console.error('Failed to fetch token expiry warning configuration, using defaults:', error);
    return getValidatedWarningDays();
  }
};
