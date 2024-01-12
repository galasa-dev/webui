/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { AuthenticationAPIApi } from '@/generated/galasaapi';
import { createApiConfiguration, createAuthenticatedApiConfiguration } from './api';
import { cookies } from 'next/headers';
import AuthCookies from './authCookies';

const GALASA_API_SERVER_URL = process.env.GALASA_API_SERVER_URL ?? '';
const GALASA_WEBUI_HOST_URL = process.env.GALASA_WEBUI_HOST_URL ?? '';

export const GALASA_WEBUI_CLIENT_ID = process.env.GALASA_WEBUI_CLIENT_ID ?? 'galasa-webui';

// Initialise an auth API client
export const authApiClient = new AuthenticationAPIApi(createApiConfiguration(GALASA_API_SERVER_URL));

/**
 * Initialise an auth API client that includes an "Authorization" header in requests.
 * @returns an auth API client that includes an "Authorization" header in requests
 */
export const getAuthApiClientWithAuthHeader = () => {
  const bearerTokenCookie = cookies().get(AuthCookies.ID_TOKEN);
  if (!bearerTokenCookie) {
    throw new Error('Unable to get bearer token, please re-authenticate');
  }
  return new AuthenticationAPIApi(createAuthenticatedApiConfiguration(GALASA_API_SERVER_URL, bearerTokenCookie.value));
};

/**
 * Sends a request to initiate an authentication flow and returns the response.
 * Note: The OpenAPI-generated code doesn't support redirects, so this method is being used instead.
 * @param clientId the ID of the Dex client to authenticate with
 * @returns the response of the /auth request
 */
export const sendAuthRequest = async (clientId: string, clientCallbackUrl = `${GALASA_WEBUI_HOST_URL}/callback`) => {
  const authRequestUrl = `/auth?client_id=${clientId}&callback_url=${clientCallbackUrl}`;

  return await fetch(new URL(authRequestUrl, GALASA_API_SERVER_URL), {
    redirect: 'manual',
  });
};
