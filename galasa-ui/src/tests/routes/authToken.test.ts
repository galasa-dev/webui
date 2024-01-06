/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import * as AuthTokenRoute from '@/app/auth/tokens/route';
import { authApiClient } from '@/utils/auth';

// Mock out the cookies() functions in the "next/headers" module
jest.mock('next/headers', () => ({
  ...jest.requireActual('next/headers'),
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}));

afterEach(() => {
  jest.resetAllMocks();
});

describe('POST /auth/tokens', () => {
  it('redirects to authenticate with the newly created Dex client', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
        headers: {
          get: jest.fn(),
        },
      })
    ) as jest.Mock;

    const mockClientId = 'mock-client';
    const mockClientSecret = 'shhhh';
    const postClientsSpy = jest.spyOn(authApiClient, 'postClients').mockReturnValue(
      Promise.resolve({
        clientId: mockClientId,
        clientSecret: mockClientSecret,
      })
    );

    // When...
    const response = await AuthTokenRoute.POST();
    const responseJson = await response.json();

    // Then...
    expect(postClientsSpy).toHaveBeenCalledTimes(1);
    expect(responseJson.url).toEqual(redirectUrl);
  });

  it('throws an error if the POST request to create a new Dex client returns an error', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    const errorMessage = 'there was an error!';
    const postClientsSpy = jest.spyOn(authApiClient, 'postClients').mockReturnValue(Promise.reject(errorMessage));

    // When/Then...
    await expect(AuthTokenRoute.POST()).rejects.toMatch(errorMessage);
    expect(postClientsSpy).toHaveBeenCalledTimes(1);
  });

  it('throws an error if the newly created Dex client does not contain a client ID and secret', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    const postClientsSpy = jest.spyOn(authApiClient, 'postClients').mockReturnValue(Promise.resolve({}));

    // When/Then...
    await expect(AuthTokenRoute.POST()).rejects.toThrow(/failed to create personal access token/i);
    expect(postClientsSpy).toHaveBeenCalledTimes(1);
  });
});
