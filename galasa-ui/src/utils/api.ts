/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ServerConfiguration, createConfiguration } from '@/generated/galasaapi';
import { ConfigurationParameters } from '@/generated/galasaapi/configuration';

/**
 * Creates an API configuration that can be passed in when initialising API clients.
 * @param apiServerUrl the URL of the API server to connect to
 * @returns an API configuration
 */
export const createApiConfiguration = (apiServerUrl: string) => {
  const serverConfig = new ServerConfiguration(apiServerUrl, {});
  return createConfiguration({ baseServer: serverConfig });
};

/**
 * Creates an API configuration that can be passed in when initialising API clients that require
 * an "Authorization" header to be set.
 * @param apiServerUrl the URL of the API server to connect to
 * @param bearerToken the bearer token to include in a request's "Authorization" header
 * @returns a configuration that includes an "Authorization" header
 */
export const createAuthenticatedApiConfiguration = (apiServerUrl: string, bearerToken: string) => {
  const serverConfig = new ServerConfiguration(apiServerUrl, {});
  const requestConfig: ConfigurationParameters = {
    baseServer: serverConfig,
    authMethods: {
      JwtAuth: {
        tokenProvider: {
          getToken() {
            return bearerToken;
          },
        },
      },
    },
  };
  return createConfiguration(requestConfig);
};