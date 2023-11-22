/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 *  
 * @jest-environment node
 */

import * as AuthRoute from '@/app/auth/route';
import * as AuthCallbackRoute from '@/app/auth/callback/route';
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
      id_token: 'dummy-jwt',
    }),
  }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('GET /auth', () => {
  it('redirects to authorization URL', async () => {
    // Given...
    const dummyClient = new BaseClient({ client_id: 'dummy' });
    const openIdClientSpy = jest.spyOn(Auth, 'getOpenIdClient').mockReturnValue(Promise.resolve(dummyClient));
    const redirectSpy = jest.spyOn(NextNavigation, 'redirect');

    // When...
    await AuthRoute.GET();

    // Then...
    expect(openIdClientSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith('dex-issuer/auth');
  });
});
