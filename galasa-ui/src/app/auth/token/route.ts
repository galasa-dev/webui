/*
 * Copyright contributors to the Galasa project
 */

import { getAuthorizationUrl, getOpenIdClient } from '@/utils/auth';
import { createDexClient } from '@/utils/grpc/client';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

// POST request handler for requests to /auth/token
export async function POST(request: Request) {
  const body = await request.json();
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/token/callback`;

  let responseJson: { url: string; error?: string } = { url: '/' };

  try {
    const dexClient = await createDexClient(body.name, Buffer.from(body.secret, 'base64').toString(), callbackUrl);

    if (dexClient?.id && dexClient?.secret) {
      const openIdClient = await getOpenIdClient(dexClient.id, dexClient.secret, callbackUrl);
      const authUrl = getAuthorizationUrl(openIdClient);

      cookies().set('clientId', dexClient.id);
      cookies().set('clientSecret', body.secret);
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