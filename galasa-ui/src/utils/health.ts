/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { BootstrapAPIApi, OpenAPIAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { CLIENT_API_VERSION } from "@/utils/constants/common";

export async function getServiceHealthStatus() {

  const apiConfig = createAuthenticatedApiConfiguration();
  const bootstrapApiClient = new BootstrapAPIApi(apiConfig);
  let isGalasaServiceHealthy = false;

  try {

    await bootstrapApiClient.getEcosystemBootstrap(CLIENT_API_VERSION);
    isGalasaServiceHealthy = true;

  } catch (error : any) {
    console.error("Health check failed:", error);
  };

  return isGalasaServiceHealthy;
  
};

export async function getClientApiVersion() {

  const apiConfig = createAuthenticatedApiConfiguration();
  const openApiClient = new OpenAPIAPIApi(apiConfig);

  const response = await openApiClient.getOpenApiSpec(CLIENT_API_VERSION);
  return response?.info?.version;

};
