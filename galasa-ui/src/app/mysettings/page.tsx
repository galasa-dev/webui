/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import AccessTokensSection from '@/components/AccessTokensSection';
import TokenResponseModal from '@/components/tokens/TokenResponseModal';
import PageTile from '@/components/PageTile';
import { AuthenticationAPIApi, UsersAPIApi, AuthTokens } from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import * as Constants from "@/utils/constants";

export default function MySettings() {
  const apiConfig = createAuthenticatedApiConfiguration();

  const clientId = cookies().get(AuthCookies.CLIENT_ID)?.value ?? '';
  const refreshToken = cookies().get(AuthCookies.REFRESH_TOKEN)?.value ?? '';

  // Server Action to delete auth-related cookies
  const deleteCookies = async () => {
    'use server';

    cookies().delete(AuthCookies.CLIENT_ID);
    cookies().delete(AuthCookies.REFRESH_TOKEN);
  };

  const fetchUserLoginId = async () => {
    const usersApiClient = new UsersAPIApi(apiConfig);
    const userResponse = await usersApiClient.getUserByLoginId(Constants.CLIENT_API_VERSION, "me");

    let loginId: string | undefined;
    if (userResponse.length > 0) {
      loginId = userResponse[0].loginId;
      if (!loginId) {  
        throw new Error("Unable to get current user ID from the Galasa API server");
      }
    }
    return loginId;
  };

  const fetchAccessTokens = async () => {
    const authApiClient = new AuthenticationAPIApi(apiConfig);

    let accessTokens: AuthTokens | undefined;
    const loginId = await fetchUserLoginId();;
    if (loginId) {
      const tokensResponse = await authApiClient.getTokens(Constants.CLIENT_API_VERSION, loginId);
      if (tokensResponse && tokensResponse.tokens) {
        accessTokens = structuredClone(tokensResponse);
      }
    }
    return accessTokens;
  };

  return (
    <main id="content">
      <PageTile title={"My Settings"} />
      <AccessTokensSection accessTokensPromise={fetchAccessTokens()} />
      <TokenResponseModal refreshToken={refreshToken} clientId={clientId} onLoad={deleteCookies} />
    </main>
  );
};