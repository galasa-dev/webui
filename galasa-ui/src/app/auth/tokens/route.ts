/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { sendAuthRequest } from '@/utils/auth';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { AuthenticationAPIApi } from '@/generated/galasaapi';

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

interface TokenDetails {
  tokenDescription: string;
}

// POST request handler for requests to /auth/tokens
export async function POST(request: NextRequest) {
  // Call out to the API server's /auth/clients endpoint to create a new Dex client

  const authApiClientWithAuthHeader = new AuthenticationAPIApi(
    createAuthenticatedApiConfiguration()
  );
  const dexClient = await authApiClientWithAuthHeader.postClients();

  const clientId = dexClient.clientId;
  if (clientId) {
    // Store the client ID to be displayed to the user later
    cookies().set(AuthCookies.CLIENT_ID, clientId, { httpOnly: true });

    // Store the token description to be passed to the API server on the callback
    const requestBody: TokenDetails = await request.json();
    cookies().set(AuthCookies.TOKEN_DESCRIPTION, requestBody.tokenDescription, { httpOnly: true });

    // Authenticate with the created client to get a new refresh token for this client
    const authResponse = await sendAuthRequest(clientId);
    const response = NextResponse.json({
      url: authResponse.headers.get('Location') ?? authResponse.url,
    });
    response.headers.set('Set-Cookie', authResponse.headers.get('Set-Cookie') ?? '');

    cookies().set(AuthCookies.SHOULD_REDIRECT_TO_SETTINGS, 'true', { httpOnly: false });

    return response;
  } else {
    throw new Error('Failed to create personal access token.');
  }
}

export async function DELETE(request: NextRequest) {
  const { tokenId } = await request.json();

  if (!tokenId) {
    return new NextResponse('Token ID is required', { status: 400 });
  }

  const authApiClientWithAuthHeader = new AuthenticationAPIApi(
    createAuthenticatedApiConfiguration()
  );

  await authApiClientWithAuthHeader.deleteToken(tokenId);

  return new NextResponse(null, { status: 204 });
}
