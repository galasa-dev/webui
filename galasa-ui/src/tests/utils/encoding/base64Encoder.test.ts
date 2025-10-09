/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { encodeToBase64, encodeToBase64Url } from '@/utils/encoding/base64Encoder';

describe('Base64 Encoder tests', () => {
  it('should correctly encode a string into Base64 format', () => {
    // Given...
    const rawString = 'myRawString';
    const expectedString = Buffer.from(rawString).toString('base64');

    // When...
    const encodedString = encodeToBase64(rawString);

    // The encoded string should not be the same as the original
    expect(encodedString).toEqual(expectedString);
  });

  it('should correctly encode a string into Base64URL format', () => {
    // Given...
    const rawString = 'myRawString-with+special/chars==';
    const expectedString = Buffer.from(rawString)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');

    // When...
    const encodedString = encodeToBase64Url(rawString);

    // The encoded string should not be the same as the original
    expect(encodedString).toEqual(expectedString);
  });
});
