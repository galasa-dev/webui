/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * 
 * @jest-environment node
 */
import * as AuthTokenCallbackRoute from '@/app/auth/token/callback/route';
import * as Auth from '@/utils/auth';
import * as NextNavigation from 'next/navigation';
import { BaseClient, generators } from 'openid-client';
import { cookies } from 'next/headers';

// Mock out the redirect() function in the next/navigation module
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock out the openid-client module
jest.mock('openid-client', () => ({
  BaseClient: jest.fn(() => ({
    authorizationUrl: jest.fn(),
    callbackParams: jest.fn(),
    callback: jest.fn(),
  })),
  generators: {
    state: jest.fn(),
  },
}));

// Mock out the next/headers module
jest.mock('next/headers');

beforeEach(() => {
  // Mock the cookies() function and its methods
  const mockCookies = cookies as jest.Mock;
  mockCookies.mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }));

  // Mock the BaseClient class
  const mockBaseClient = BaseClient as unknown as jest.Mock;
  mockBaseClient.mockImplementation(() => ({
    authorizationUrl: jest.fn().mockReturnValue('dex-issuer/auth'),
    callbackParams: jest.fn(),
    callback: jest.fn().mockReturnValue({
      refresh_token: 'dummy-refresh',
    }),
  }));

  // Mock the generators.state() method
  const mockStateGenerator = generators.state as unknown as jest.Mock;
  mockStateGenerator.mockImplementation(() => ({
    state: jest.fn(),
  }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('GET /auth/token/callback', () => {
  it('stores a refresh token in a cookie and redirects to index page', async () => {
    // Given...
    // Override the mocked cookies() function and its methods
    const mockCookies = cookies as jest.Mock;
    const setCookieSpy = jest.fn();
    const deleteCookieSpy = jest.fn();
    mockCookies.mockImplementation(() => ({
      get: jest.fn().mockReturnValue({ value: 'dummy-state' }),
      set: setCookieSpy,
      delete: deleteCookieSpy,
    }));

    const dummyClient = new BaseClient({ client_id: 'dummy' });
    const openIdClientSpy = jest.spyOn(Auth, 'getOpenIdClient').mockReturnValue(Promise.resolve(dummyClient));
    const redirectSpy = jest.spyOn(NextNavigation, 'redirect');

    // When...
    const dummyRequest = new Request('http://dummy/callback');
    await AuthTokenCallbackRoute.GET(dummyRequest);

    // Then...
    expect(openIdClientSpy).toHaveBeenCalledTimes(1);
    expect(setCookieSpy).toHaveBeenCalledWith('refresh_token', 'dummy-refresh');
    expect(deleteCookieSpy).toHaveBeenCalledWith('state');
    expect(redirectSpy).toHaveBeenCalledWith('/');
  });

  it('retries the auth process if the OpenID callback fails', async () => {
    // Given...
    // Override the BaseClient's callback method to throw an error
    const mockBaseClient = BaseClient as unknown as jest.Mock;
    const mockError = new Error('dummy error!');
    mockBaseClient.mockImplementation(() => ({
      callbackParams: jest.fn(),
      callback: jest.fn(() => {
        throw mockError;
      }),
    }));

    const dummyClient = new BaseClient({ client_id: 'dummy' });
    const openIdClientSpy = jest.spyOn(Auth, 'getOpenIdClient').mockReturnValue(Promise.resolve(dummyClient));
    const redirectSpy = jest.spyOn(NextNavigation, 'redirect');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // When...
    const dummyRequest = new Request('http://dummy/callback');
    await AuthTokenCallbackRoute.GET(dummyRequest);

    // Then...
    expect(openIdClientSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
    expect(redirectSpy).toHaveBeenCalledWith('/');
  });
});
