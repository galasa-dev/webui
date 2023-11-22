/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { NextResponse, NextRequest } from 'next/server';

// Checks if a cookie containing a JWT exists, redirecting users to authenticate
// if a JWT does not exit or if the existing token has expired.
const isAuthenticated = (request: NextRequest) => {
  const idToken = request.cookies.get('id_token');
  let isAuthenticated = false;
  if (idToken) {
    if (!isTokenExpired(idToken.value)) {
      isAuthenticated = true;
    }
  }
  return isAuthenticated;
};

// Checks whether a given JWT is expired, returning true if so, and false otherwise.
const isTokenExpired = (jwt: string) => {
  let isExpired = true;

  try {
    const decodedJwt = jwtDecode(jwt) as JwtPayload;
    const jwtExpiry = decodedJwt.exp;

    if (jwtExpiry) {
      const currentTimeEpochMilliseconds = Date.now()

      // A JWT's expiry time is a Unix timestamp (number of seconds since the Unix Epoch),
      // so the format of the current time must match to calculate the correct difference.
      isExpired = ((jwtExpiry * 1000) - currentTimeEpochMilliseconds) <= 0;
    }
  } catch (err) {
    // Do nothing - the JWT is invalid, so it will be marked as expired to force re-authentication.
  }
  return isExpired;
};

// Runs before any request is completed
export function middleware(request: NextRequest) {
  let response = NextResponse.next();
  if (!isAuthenticated(request)) {
    response = NextResponse.redirect(new URL('/auth', request.url));
  }
  return response;
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with /auth.
    '/((?!auth).*)',
  ],
};
