/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import * as AuthTokenRoute from '@/app/auth/tokens/route';
import { AuthenticationAPIApi } from '@/generated/galasaapi';
import { NextRequest } from 'next/server';
import { DELETE } from '@/app/auth/tokens/route';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import AuthCookies from '@/utils/authCookies';

const mockAuthenticationApi = AuthenticationAPIApi as jest.Mock;

const deleteMock = jest.fn();

// Mock out the cookies() functions in the "next/headers" module
jest.mock('next/headers', () => ({
  ...jest.requireActual('next/headers'),
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('abc'),
    set: jest.fn(),
    delete: deleteMock
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

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    })

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
        headers: {
          get: jest.fn(),
        },
      })
    ) as jest.Mock;

    // When...
    const response = await AuthTokenRoute.POST(request);
    const responseJson = await response.json();

    // Then...
    expect(responseJson.url).toEqual(redirectUrl);
  });

  it('throws an error if the POST request to create a new Dex client returns an error', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    })

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody })

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
    await expect(AuthTokenRoute.POST(request)).rejects.toMatch(errorMessage);
    mockAuthenticationApi.mockReset();
  });

  it('throws an error if the newly created Dex client does not contain a client ID', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    })

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody })

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    mockAuthenticationApi.mockReturnValue({
      postClients: jest.fn(() => Promise.resolve({})),
    });

    // When/Then...
    await expect(AuthTokenRoute.POST(request)).rejects.toThrow(/failed to create personal access token/i);
    mockAuthenticationApi.mockReset();
  });
});

describe('DELETE /auth/tokens', () => {

  beforeEach(() => {

    jest.clearAllMocks();

  });

  it('Fetches cookies from headers, that are not null, GIVES 204 RESPONSE', async () => {

    const response = await DELETE()

    expect(deleteMock).toBeCalledWith(AuthCookies.ID_TOKEN);
    expect(deleteMock).toBeCalledTimes(1)
    expect(response.status).toBe(204);

  })


});