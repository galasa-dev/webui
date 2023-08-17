/**
 * Copyright contributors to the Galasa project
 * @jest-environment node
 */

import * as AuthTokenRoute from '@/app/auth/token/route';
import * as Auth from '@/utils/auth';
import * as GrpcClient from '@/utils/grpc/client';
import { BaseClient, generators } from 'openid-client';
import { cookies } from 'next/headers';

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

  // Mock the generators.state() method
  const mockStateGenerator = generators.state as unknown as jest.Mock;
  mockStateGenerator.mockImplementation(() => ({
    state: jest.fn(),
  }));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('POST /auth/token', () => {
  it('returns a JSON response containing an authorization URL', async () => {
    // Given...
    const dummyClient = new BaseClient({ client_id: 'dummy' });
    jest.spyOn(Auth, 'getOpenIdClient').mockReturnValue(Promise.resolve(dummyClient));
    const createDexClientSpy = jest.spyOn(GrpcClient, 'createDexClient').mockReturnValue(
      Promise.resolve({
        id: 'test',
        secret: 'abc',
      })
    );

    // When...
    const response = await AuthTokenRoute.POST();
    const responseJson = await response.json();

    // Then...
    expect(responseJson.url).toEqual('dex-issuer/auth');
    expect(responseJson.error).toBeUndefined();
    expect(createDexClientSpy).toHaveBeenCalledWith(expect.stringContaining('/auth/token/callback'));
  });

  it('returns the index page URL if the Dex client failed to get created', async () => {
    // Given...
    const dummyClient = new BaseClient({ client_id: 'dummy' });
    jest.spyOn(Auth, 'getOpenIdClient').mockReturnValue(Promise.resolve(dummyClient));

    // Mock the function that creates a dex client to throw an error
    const dummyError = new Error('dex client was not created!')
    const createDexClientSpy = jest.spyOn(GrpcClient, 'createDexClient').mockReturnValue(
      Promise.reject(dummyError)
    );

    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // When...
    const response = await AuthTokenRoute.POST();
    const responseJson = await response.json();

    // Then...
    expect(responseJson.url).toEqual('/');
    expect(responseJson.error).toEqual(dummyError.message);
    expect(consoleErrorSpy).toHaveBeenCalledWith(dummyError);
    expect(createDexClientSpy).toHaveBeenCalledWith(expect.stringContaining('/auth/token/callback'));
  });
});
