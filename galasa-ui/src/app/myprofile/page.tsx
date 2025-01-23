/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import * as Constants from "@/utils/constants";
import PageTile from "@/components/PageTile";
import { UserData, UsersAPIApi } from "@/generated/galasaapi";
import ProfileDetails from "@/components/profile/ProfileDetails";
import { createAuthenticatedApiConfiguration } from "@/utils/api";

export default function MyProfilePage() {
  const apiConfig = createAuthenticatedApiConfiguration();

  const fetchUserProfile = async () => {
    let userProfile: UserData = {};

    const usersApiClient = new UsersAPIApi(apiConfig);
    const usersResponse = await usersApiClient.getUserByLoginId(Constants.CLIENT_API_VERSION, "me");

    if (usersResponse && usersResponse.length > 0) {
      // The openapi-generated "UserData" model is generated as a class, which can't be passed down
      // to client components by reference, so deep clone the object
      const currentUser = usersResponse[0];
      userProfile = structuredClone(currentUser);
    }
    return userProfile;
  };

  return (
    <main id="content">
      <PageTile title={"My Profile"} />
      <ProfileDetails userProfilePromise={fetchUserProfile()} />
    </main>
  );
};
