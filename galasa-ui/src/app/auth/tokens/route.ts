/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { authApiClient, sendAuthRequest } from '@/utils/auth';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// POST request handler for requests to /auth/tokens
export async function POST() {
  // Call out to the API server's /auth/clients endpoint to create a new Dex client
  const dexClient = await authApiClient.postClients();

  const clientId = dexClient.clientId;
  const clientSecret = dexClient.clientSecret;
  if (clientId && clientSecret) {
    // Store the client ID and secret to be displayed to the user later
    cookies().set(AuthCookies.CLIENT_ID, clientId, { httpOnly: true });
    cookies().set(AuthCookies.CLIENT_SECRET, Buffer.from(clientSecret).toString('base64'), { httpOnly: true });

    // Authenticate with the created client to get a new refresh token for this client
    const authResponse = await sendAuthRequest(clientId);

    const response = NextResponse.json({ url: authResponse.headers.get('Location') ?? authResponse.url });
    response.headers.set('Set-Cookie', authResponse.headers.get('Set-Cookie') ?? '');

    return response;
  } else {
    throw new Error('Failed to create personal access token.');
  }
}
