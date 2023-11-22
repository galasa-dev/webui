/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { getAuthorizationUrl, getOpenIdClient } from '@/utils/auth';
import AuthCookies from '@/utils/authCookies';
import { createDexClient } from '@/utils/grpc/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// POST request handler for requests to /auth/token
export async function POST() {
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/token/callback`;

  let responseJson: { url: string; error?: string } = { url: '/' };

  try {
    const dexClient = await createDexClient(callbackUrl);

    if (dexClient?.id && dexClient?.secret) {
      const openIdClient = await getOpenIdClient(dexClient.id, dexClient.secret, callbackUrl);
      const authUrl = getAuthorizationUrl(openIdClient);

      cookies().set(AuthCookies.CLIENT_ID, dexClient.id);
      cookies().set(AuthCookies.CLIENT_SECRET, Buffer.from(dexClient.secret).toString('base64'));
      responseJson = { url: authUrl };
    }
  } catch (err) {
    if (err instanceof Error) {
      responseJson.error = err.message;
    }
    console.error(err);
  }

  return NextResponse.json(responseJson);
}
