/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use server";
import { UserData, UsersAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import * as Constants from "@/utils/constants/common";
import { UpdateUserRolePayload } from "@/utils/interfaces";


export async function updateUserRoleAction(
  requestBody: UpdateUserRolePayload
): Promise<{ status: number; message: string }> {

  const apiConfig = createAuthenticatedApiConfiguration();

  if (!requestBody.userNumber || !requestBody.roleDetails?.role) {
    throw new Error('Role ID and User Number are required');
  }

  const usersApiClient = new UsersAPIApi(apiConfig);

  try {

    await usersApiClient.updateUser(
      requestBody.userNumber,
      requestBody.roleDetails,
      Constants.CLIENT_API_VERSION
    );

    return { status: 200, message: 'User role updated successfully' };
  } catch (error: any) {
    console.error(error);

    if (error.response?.status === 403) {
      throw new Error('Forbidden: You do not have permission to update this user.');
    } else if (error.response?.status === 404) {
      throw new Error('Not Found: The specified user does not exist.');
    }
    throw new Error('Internal Server Error');
  }
}

export const fetchUserFromApiServer = async (loginId: string) => {

  const apiConfig = createAuthenticatedApiConfiguration();

  let user: UserData = {};
  const usersApiClient = new UsersAPIApi(apiConfig);
  const usersReponse = await usersApiClient.getUserByLoginId(Constants.CLIENT_API_VERSION, loginId);

  if (usersReponse && usersReponse.length > 0) {
    user = structuredClone(usersReponse[0]);
  }

  return user;
};

export const deleteUserFromService = async (userNumber: string) => {

  if (!userNumber) {
    throw new Error('User Number is required');
  }

  const apiConfig = createAuthenticatedApiConfiguration();
  const usersApiClient = new UsersAPIApi(apiConfig);

  try {

    await usersApiClient.deleteUserByNumber(userNumber, Constants.CLIENT_API_VERSION);

  } catch (error: any) {
    console.error(error);

    if (error.response?.status === 403) {
      throw new Error('Forbidden: You do not have permission to delete this user.');
    } else if (error.response?.status === 404) {
      throw new Error('Not Found: The specified user does not exist.');
    }
    throw new Error('Internal Server Error');
  }
};