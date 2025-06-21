/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { AuthenticationAPIApi, AuthTokens } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import * as Constants from "@/utils/constants/common";

export const fetchAccessTokens = async (loginId: string) => {

  const apiConfig = createAuthenticatedApiConfiguration();

  const authApiClient = new AuthenticationAPIApi(apiConfig);

  let accessTokens: AuthTokens | undefined;
  if (loginId) {
    const tokensResponse = await authApiClient.getTokens(Constants.CLIENT_API_VERSION, loginId);
    if (tokensResponse && tokensResponse.tokens) {
      accessTokens = structuredClone(tokensResponse);
    }
  }
  return accessTokens;
};