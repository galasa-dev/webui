/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use server";
import { ConfigurationPropertyStoreAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { NextResponse } from "next/server";

const NAMESPACE = "service";
const PROPERTY_NAME = "welcome.markdown";

export async function GET() {

  let data;
  const cpsApiClientWithAuthHeader = new ConfigurationPropertyStoreAPIApi(createAuthenticatedApiConfiguration());
  const response = await cpsApiClientWithAuthHeader.getCpsProperty(NAMESPACE, PROPERTY_NAME);

  if (response.length > 0 && response[0]) {
    data = response[0].data?.value;
  }

  return new NextResponse(data, { status: 200 });

}