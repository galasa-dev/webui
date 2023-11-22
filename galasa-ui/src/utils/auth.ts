/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { cookies } from "next/headers";
import { BaseClient, Issuer, generators } from "openid-client";

// Get an OpenID client for the WebUI as registered with Dex
export const getOpenIdClient = async (clientId: string, clientSecret: string, callbackUrl: string) => {
  const issuerUrl = process.env.DEX_ISSUER_URL ?? 'http://127.0.0.1:5556/dex';

  return Issuer.discover(issuerUrl).then(
    (dexIssuer) =>
      new dexIssuer.Client({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: [callbackUrl],
        response_types: ['code'],
      })
  );
};

// Get the authorization URL for an OpenID client that has been registered with Dex
export const getAuthorizationUrl = (openIdClient: BaseClient) => {
  const state = generators.state();
  const authUrl = openIdClient.authorizationUrl({
    scope: 'openid offline_access',
    state,
  });

  // Save the state parameter in a cookie so that it can be checked during the callback to the webui.
  cookies().set('state', state);
  return authUrl;
};