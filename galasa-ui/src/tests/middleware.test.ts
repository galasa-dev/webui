/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { middleware } from '@/middleware';
import { authApiClient } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

// Mock the jwtDecode method
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    exp: 50, // JWT expiry in seconds
  })),
}));

describe('Middleware', () => {
  let redirectSpy: jest.SpyInstance;

  beforeEach(() => {
    redirectSpy = jest.spyOn(NextResponse, 'redirect').mockReturnValue(new NextResponse());
  });

  afterEach(() => {
    redirectSpy.mockReset();
  });

  it('should redirect to authenticate if the user does not have a JWT', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
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
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl, { status: 302 });
  });

  it('should redirect to authenticate if the issued JWT has expired in the past', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
        headers: {
          get: jest.fn(),
        },
      })
    ) as jest.Mock;

    // Mock JWTs have been set to expire after 50s, so let's set the current time to >50000ms
    Date.now = jest.fn(() => 68764);

    // When...
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl, { status: 302 });
  });

  it('should redirect to authenticate if the issued JWT has expired exactly now', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');

    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
        headers: {
          get: jest.fn(),
        },
      })
    ) as jest.Mock;

    // Mock JWTs have been set to expire after 50s, so let's set the current time to exactly 50000ms
    Date.now = jest.fn(() => 50000);

    // When...
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl, { status: 302 });
  });

  it('should not redirect a user to authenticate if they are authenticated with a valid JWT', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');
    Date.now = jest.fn(() => 4324);

    // When...
    const response = await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(0);
    expect(response.status).toEqual(200);
  });

  it('should send a POST request to get a JWT during a callback to log in to the web UI', async () => {
    // Given...
    redirectSpy.mockRestore();

    const expectedResponseUrl = 'https://galasa-ecosystem.com';
    const req = new NextRequest(new Request(`${expectedResponseUrl}/callback?code=myauthcode`), {});
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    const mockIdToken = 'mynewjwt';
    const postAuthenticateSpy = jest.spyOn(authApiClient, 'postAuthenticate').mockReturnValue(
      Promise.resolve({
        jwt: mockIdToken,
        refreshToken: 'mynewrefreshtoken',
      })
    );

    // When...
    const response = await middleware(req);

    // Then...
    expect(postAuthenticateSpy).toHaveBeenCalledTimes(1);
    expect(response.cookies.get('id_token')?.value).toEqual(mockIdToken);

    postAuthenticateSpy.mockReset();
  });

  it('should set a refresh token cookie during a callback request with client ID and secret cookies', async () => {
    // Given...
    redirectSpy.mockRestore();

    const expectedResponseUrl = 'https://galasa-ecosystem.com';
    const req = new NextRequest(new Request(`${expectedResponseUrl}/callback?code=myauthcode`), {});
    const redirectUrl = 'http://my-connector/auth';

    req.cookies.set('client_id', 'my-client-id');
    req.cookies.set('client_secret', 'shhh');

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    const mockRefreshToken = 'mynewrefreshtoken';
    const postAuthenticateSpy = jest.spyOn(authApiClient, 'postAuthenticate').mockReturnValue(
      Promise.resolve({
        jwt: 'mynewjwt',
        refreshToken: mockRefreshToken,
      })
    );

    // When...
    const response = await middleware(req);

    // Then...
    expect(postAuthenticateSpy).toHaveBeenCalledTimes(1);
    expect(response.cookies.get('refresh_token')?.value).toEqual(mockRefreshToken);
    expect(response.cookies.has('id_token')).toEqual(false);

    postAuthenticateSpy.mockReset();
  });

  it('should issue a rewrite to the error page if something goes wrong during the authentication process', async () => {
    // Given...
    const requestUrl = 'https://galasa-ecosystem.com';
    const req = new NextRequest(new Request(requestUrl), {});

    global.fetch = jest.fn(() => Promise.reject('this is an error!')) as jest.Mock;

    const rewriteSpy = jest.spyOn(NextResponse, 'rewrite');

    // When...
    await middleware(req);

    // Then...
    expect(rewriteSpy).toHaveBeenCalledTimes(1);
    expect(rewriteSpy).toHaveBeenCalledWith(new URL('/error', requestUrl));
    expect(redirectSpy).not.toHaveBeenCalled();

    rewriteSpy.mockReset();
  });
});
