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

  it('should redirect to the /auth route if the user does not have a JWT', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});

    // When...
    middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(new URL('/auth', req.url));
  });

  it('should redirect to the /auth route if the issued JWT has expired in the past', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');

    // Expiry is 50s, so setting current time to >50000ms
    Date.now = jest.fn(() => 68764)

    // When...
    middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
    expect(redirectSpy).toHaveBeenCalledWith(new URL('/auth', req.url));
  });

  it('should redirect to the /auth route if the issued JWT has expired at exactly now', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');

    // Expiry is 50s, so setting current time to 50000ms
    Date.now = jest.fn(() => 50000)

    // When...
    middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(1);
  });

  it('should not redirect a user to authenticate if they are authenticated with a valid JWT', async () => {
    // Given...
    const req = new NextRequest(new Request('https://galasa-ecosystem.com/runs'), {});
    req.cookies.set('id_token', 'valid-token');
    Date.now = jest.fn(() => 4324)

    // When...
    middleware(req);

    // Then...
    expect(redirectSpy).toHaveBeenCalledTimes(0);
  });
});
