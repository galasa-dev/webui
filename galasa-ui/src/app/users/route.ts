/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { UsersAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import AuthCookies from "@/utils/authCookies";
import * as Constants from "@/utils/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

export async function GET() {

  "use server";

  try {
        
    const userApiClientWithAuthHeader = new UsersAPIApi(createAuthenticatedApiConfiguration());

    const response = await userApiClientWithAuthHeader.getUserByLoginId(Constants.CLIENT_API_VERSION,"me");
    const userData = response[0];

    return NextResponse.json({ userData: userData }, { status: 200 });

  } catch (err) {
    throw new Error("Failed to get login id of user");
  }

}

export async function DELETE() {

  "use server";

  // an api route is made because, cookies are server side props and cannot be access directly on components
  // that use 'use client' keyword.

  cookies().delete(AuthCookies.ID_TOKEN);
  cookies().delete(AuthCookies.SHOULD_REDIRECT_TO_SETTINGS);
  
  return (new NextResponse(null, { status: 204 }));
  
}