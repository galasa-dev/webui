/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { middleware } from '@/middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock the jwtDecode method
jest.mock('jwt-decode', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    exp: 50, // JWT expiry in seconds
  }),
)}));

describe('Middleware', () => {
  const redirectSpy = jest.spyOn(NextResponse, 'redirect');

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
      })
    ) as jest.Mock;

    // When...
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl);
  });

  it('should redirect to authenticate if the issued JWT has expired in the past', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');
    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    // Mock JWTs have been set to expire after 50s, so let's set the current time to >50000ms
    Date.now = jest.fn(() => 68764);

    // When...
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl);
  });

  it('should redirect to authenticate if the issued JWT has expired exactly now', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');

    const redirectUrl = 'http://my-connector/auth';

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    // Mock JWTs have been set to expire after 50s, so let's set the current time to exactly 50000ms
    Date.now = jest.fn(() => 50000)

    // When...
    await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(redirectUrl);
  });

  it('should not redirect a user to authenticate if they are authenticated with a valid JWT', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');
    Date.now = jest.fn(() => 4324)

    // When...
    const response = await middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(0);
    expect(response.status).toEqual(200);
  });
});
