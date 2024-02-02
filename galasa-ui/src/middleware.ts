/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import jwtDecode, { JwtPayload } from 'jwt-decode';
import { NextResponse, NextRequest } from 'next/server';
import AuthCookies from './utils/authCookies';
import { GALASA_WEBUI_CLIENT_ID, authApiClient, sendAuthRequest } from './utils/auth';
import { AuthProperties } from './generated/galasaapi';

// Runs before any request is completed
export async function middleware(request: NextRequest) {
  let response = NextResponse.rewrite(new URL('/error', request.url));

  try {
    if (request.url.includes('/callback')) {
      // Handle callback requests
      const responseUrl = request.url.substring(0, request.url.lastIndexOf('/callback'));
      response = await handleCallback(request, NextResponse.redirect(responseUrl, { status: 302 }));
    } else if (!isAuthenticated(request)) {

      // Force the user to re-authenticate, getting the URL to redirect to and any cookies to be set
      const authResponse = await sendAuthRequest(GALASA_WEBUI_CLIENT_ID);
      const locationHeader = authResponse.headers.get('Location');
      if (locationHeader) {
        response = NextResponse.redirect(locationHeader, { status: 302 });
        response.headers.set('Set-Cookie', authResponse.headers.get('Set-Cookie') ?? '');
      }
    } else {
      // User is authenticated and the request can go through
      response = NextResponse.next();
    }
  } catch(err) {
    console.error('Failed to authenticate with the Galasa Ecosystem: %s', err);
  }
  return response;
}

// Checks if a cookie containing a JWT exists, redirecting users to authenticate
// if a JWT does not exit or if the existing token has expired.
const isAuthenticated = (request: NextRequest) => {
  const idToken = request.cookies.get(AuthCookies.ID_TOKEN);
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
      const currentTimeEpochMilliseconds = Date.now();

      // A JWT's expiry time is a Unix timestamp (number of seconds since the Unix Epoch),
      // so the format of the current time must match to calculate the correct difference.
      isExpired = ((jwtExpiry * 1000) - currentTimeEpochMilliseconds) <= 0;
    }
  } catch (err) {
    // Do nothing - the JWT is invalid, so it will be marked as expired to force re-authentication.
  }
  return isExpired;
};

// Handler for any callback request. This allows any page on the webui to have a callback route,
// so if a user needs to re-authenticate, they can do so and then be returned to the page that
// they were originally looking at.
const handleCallback = async (request: NextRequest, response: NextResponse) => {
  const queryParams = request.nextUrl.searchParams;
  const code = queryParams.get('code');

  if (code) {
    let clientId = '';
    const clientIdCookie = request.cookies.get(AuthCookies.CLIENT_ID);

    if (!clientIdCookie) {
      clientId = process.env.GALASA_WEBUI_CLIENT_ID ?? '';
    } else {
      clientId = clientIdCookie.value;
    }

    // Build the request body
    const authProperties = buildAuthProperties(clientId, code);

    // Send a POST request to the API server's /auth endpoint to exchange the authorization code with a JWT
    const tokenResponse = await authApiClient.postAuthenticate(authProperties);

    if (tokenResponse.jwt && !clientIdCookie) {
      response.cookies.set(AuthCookies.ID_TOKEN, tokenResponse.jwt, { httpOnly: true });
    } else if (tokenResponse.refreshToken && clientIdCookie) {
      response.cookies.set(AuthCookies.REFRESH_TOKEN, tokenResponse.refreshToken, { httpOnly: true });
    }
  }
  return response;
};

const buildAuthProperties = (clientId: string, code: string) => {
  const authProperties = new AuthProperties();

  authProperties.clientId = clientId;
  authProperties.code = code;

  return authProperties;
};

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // /error
    // /_next/static (static files)
    // /_next/image (image optimisations)
    // /favicon.ico
    '/((?!error|_next/static|_next/image|favicon.ico).*)',
  ],
};
