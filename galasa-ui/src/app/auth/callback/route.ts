/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

import { getOpenIdClient } from '@/utils/auth';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// GET request handler for requests to /auth/callback
export async function GET(request: Request) {
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/callback`;
  const openIdClient = await getOpenIdClient('galasa-webui', `${process.env.DEX_CLIENT_SECRET}`, callbackUrl);
  const state = cookies().get(AuthCookies.STATE)?.value;

  try {
    // Get the returned token set (which includes a JWT) from Dex
    const callbackParams = openIdClient.callbackParams(request.url);
    const tokenSet = await openIdClient.callback(callbackUrl, callbackParams, { state });

    // The state cookie is no longer needed, so we can delete it.
    cookies().delete(AuthCookies.STATE);

    // Set the ID token cookie
    if (tokenSet.id_token) {
      cookies().set(AuthCookies.ID_TOKEN, tokenSet.id_token);
    }
  } catch (err) {
    console.error(err);
  }
  redirect('/');
}
