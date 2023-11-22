/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { getOpenIdClient } from '@/utils/auth';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// GET request handler for requests to /auth/token/callback
export async function GET(request: Request) {
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/token/callback`;
  const clientId = cookies().get(AuthCookies.CLIENT_ID)?.value;
  const clientSecret = Buffer.from(`${cookies().get(AuthCookies.CLIENT_SECRET)?.value}`, 'base64').toString();
  const state = cookies().get(AuthCookies.STATE)?.value;

  const openIdClient = await getOpenIdClient(`${clientId}`, clientSecret, callbackUrl);

  try {
    // Get the returned token set (which includes a JWT) from Dex
    const callbackParams = openIdClient.callbackParams(request.url);
    const tokenSet = await openIdClient.callback(callbackUrl, callbackParams, { state });

    // The state cookie is no longer needed, so we can delete it
    cookies().delete(AuthCookies.STATE);

    // Set the refresh token cookie
    if (tokenSet.refresh_token) {
      cookies().set(AuthCookies.REFRESH_TOKEN, tokenSet.refresh_token);
    }
  } catch (err) {
    console.error(err);
  }
  redirect('/');
}
