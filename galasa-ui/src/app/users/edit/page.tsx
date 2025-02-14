/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import EditUserBreadCrumb from '@/components/common/EditUserBreadCrumb';
import PageTile from '@/components/PageTile';
import UserRoleSection from '@/components/users/UserRoleSection';
import React from 'react';
import { UserData, UsersAPIApi } from '@/generated/galasaapi';
import * as Constants from "@/utils/constants";
import { createAuthenticatedApiConfiguration } from '@/utils/api';

// In order to extract query param on server-side
type UsersPageProps = {
  params: {}; // No dynamic route parameters
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function EditUserPage({searchParams} : UsersPageProps) {

  const apiConfig = createAuthenticatedApiConfiguration();
  const loginIdFromQueryParam = searchParams.loginId as string;

  const fetchUserFromApiServer = async () => {

    let user: UserData = {};
    const usersApiClient = new UsersAPIApi(apiConfig);

    const usersReponse = await usersApiClient.getUserByLoginId(Constants.CLIENT_API_VERSION, loginIdFromQueryParam);

    if (usersReponse && usersReponse.length > 0) {
      user = structuredClone(usersReponse[0]);
    }

    return user;
  };


  return (
    <main id="content">
      <EditUserBreadCrumb />
      <PageTile title={"Edit User"} />
      <UserRoleSection userProfilePromise={fetchUserFromApiServer()}/>
    </main>
  );
}
