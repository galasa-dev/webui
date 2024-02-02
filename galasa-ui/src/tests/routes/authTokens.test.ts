/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import * as AuthTokenRoute from '@/app/auth/tokens/route';
import { AuthenticationAPIApi } from '@/generated/galasaapi';

const mockAuthenticationApi = AuthenticationAPIApi as jest.Mock;

// Mock out the cookies() functions in the "next/headers" module
jest.mock('next/headers', () => ({
  ...jest.requireActual('next/headers'),
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('abc'),
    set: jest.fn(),
  })),
}));

// Mock out the generated auth API client code
jest.mock('@/generated/galasaapi', () => ({
  ...jest.requireActual('@/generated/galasaapi'),
  AuthenticationAPIApi: jest.fn(() => ({
    postClients: jest.fn().mockReturnValue(
      Promise.resolve({
        clientId: 'dummy-id',
      })
    ),
  })),
}));

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

    // When...
    const response = await AuthTokenRoute.POST();
    const responseJson = await response.json();

    // Then...
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
    mockAuthenticationApi.mockReturnValue({
      postClients: jest.fn(() => Promise.reject(errorMessage)),
    });

    // When/Then...
    await expect(AuthTokenRoute.POST()).rejects.toMatch(errorMessage);
    mockAuthenticationApi.mockReset();
  });

  it('throws an error if the newly created Dex client does not contain a client ID', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    mockAuthenticationApi.mockReturnValue({
      postClients: jest.fn(() => Promise.resolve({})),
    });

    // When/Then...
    await expect(AuthTokenRoute.POST()).rejects.toThrow(/failed to create personal access token/i);
    mockAuthenticationApi.mockReset();
  });
});
