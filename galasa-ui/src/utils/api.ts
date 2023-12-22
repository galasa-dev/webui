/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ServerConfiguration, createConfiguration } from '@/generated/galasaapi';

/**
 * Creates an API configuration that can be passed in when initialising API clients.
 * @param apiServerUrl the URL of the API server to connect to
 * @returns an API configuration
 */
export const createApiConfiguration = (apiServerUrl: string) => {
  const serverConfig = new ServerConfiguration(apiServerUrl, {});
  return createConfiguration({ baseServer: serverConfig });
};
