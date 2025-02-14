/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { UsersAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { NextRequest, NextResponse } from "next/server";
import * as Constants from "@/utils/constants";


export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {

  const apiConfig = createAuthenticatedApiConfiguration();
  const usersApiClient = new UsersAPIApi(apiConfig);
  const requestBody = await request.json();

  if (!requestBody.userNumber || !requestBody.roleDetails?.role) {
    return new NextResponse('Role ID and User Number are required', { status: 400 });
  }

  try {
    // Attempt to update the user
    await usersApiClient.updateUser(
      requestBody.userNumber,
      requestBody.roleDetails,
      Constants.CLIENT_API_VERSION
    );
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    // Log the error for debugging
    console.error(error);

    // Check for specific error codes
    if (error.response?.status === 403) {
      return new NextResponse('Forbidden: You do not have permission to update this user.', { status: 403 });
    } else if (error.response?.status === 404) {
      return new NextResponse('Not Found: The specified user does not exist.', { status: 404 });
    }

    // Fallback for other errors
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
