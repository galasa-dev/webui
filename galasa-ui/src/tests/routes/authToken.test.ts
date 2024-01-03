/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import * as AuthTokenRoute from '@/app/auth/token/route';
import { authApiClient } from '@/utils/auth';
import { redirect } from 'next/navigation';

// Mock out the redirect() function in the "next/navigation" module
jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  redirect: jest.fn(),
}));

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

describe('POST /auth/token', () => {
  it('redirects to authenticate with the newly created Dex client', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
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
    await AuthTokenRoute.POST();

    // Then...
    expect(postClientsSpy).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledTimes(1);
    expect(redirect).toHaveBeenCalledWith(redirectUrl);
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
