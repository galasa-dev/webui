/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Converts a given string into Base64-encoded format.
 *
 * @param stringToEncode the string to be encoded
 * @returns the Base64 encoded string
 */
export const encodeToBase64 = (stringToEncode: string) => {
  return Buffer.from(stringToEncode).toString('base64');
};

/**
 * Converts a given string into Base64URL-encoded format.
 *
 * @param stringToEncode the string to be encoded
 * @returns the Base64URL encoded string
 */
export const encodeToBase64Url = (stringToEncode: string) => {
  let base64EncodedString = encodeToBase64(stringToEncode);
  return base64EncodedString.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
};
