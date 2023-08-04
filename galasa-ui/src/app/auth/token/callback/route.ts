/*
 * Copyright contributors to the Galasa project
 */

import { getOpenIdClient } from '@/utils/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// GET request handler for requests to /auth/token/callback
export async function GET(request: Request) {
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/token/callback`;
  const clientId = cookies().get('client_id')?.value;
  const clientSecret = Buffer.from(`${cookies().get('client_secret')?.value}`, 'base64').toString();
  const state = cookies().get('state')?.value;

  const openIdClient = await getOpenIdClient(`${clientId}`, clientSecret, callbackUrl);

  try {
    // Get the returned token set (which includes a JWT) from Dex
    const callbackParams = openIdClient.callbackParams(request.url);
    const tokenSet = await openIdClient.callback(callbackUrl, callbackParams, { state });

    // The state cookie is no longer needed, so we can delete it
    cookies().delete('state');

    // Set the refresh token cookie
    if (tokenSet.refresh_token) {
      cookies().set('refresh_token', tokenSet.refresh_token);
    }
  } catch (err) {
    console.error(err);
  }
  redirect('/');
}
