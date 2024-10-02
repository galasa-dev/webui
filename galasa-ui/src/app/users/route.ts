/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { UsersAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import AuthCookies from "@/utils/authCookies";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

export async function GET() {

  try {
        
    const userApiClientWithAuthHeader = new UsersAPIApi(createAuthenticatedApiConfiguration());

    const response = await userApiClientWithAuthHeader.getUserByLoginId("me");

    return (new NextResponse(response[0].loginId, { status: 200 }));
  } catch (err) {
    throw new Error("Failed to get login id of user");
  }

}

export async function DELETE() {

  // an api route is made because, cookies are server side props and cannot be access directly on components
  // that use 'use client' keyword.

  cookies().delete(AuthCookies.ID_TOKEN);
  cookies().delete(AuthCookies.SHOULD_REDIRECT_TO_SETTINGS);
  
  return (new NextResponse(null, { status: 204 }));
  
}