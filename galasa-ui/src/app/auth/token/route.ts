/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { authApiClient, sendAuthRequest } from '@/utils/auth';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// POST request handler for requests to /auth/token
export async function POST() {
  // Call out to /auth/clients
  const dexClient = await authApiClient.postClients();

  const clientId = dexClient.clientId;
  const clientSecret = dexClient.clientSecret;
  if (dexClient && clientId && clientSecret) {
    // Call out to GET /auth
    cookies().set(AuthCookies.CLIENT_ID, clientId, { httpOnly: true });
    cookies().set(AuthCookies.CLIENT_SECRET, Buffer.from(clientSecret).toString('base64'), { httpOnly: true });

    const authResponse = await sendAuthRequest(clientId);
    redirect(authResponse.url);
  }

  redirect('/');
}