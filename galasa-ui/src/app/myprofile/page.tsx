/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageTile from "@/components/PageTile";
import ProfileDetails from "@/components/profile/ProfileDetails";
import BreadCrumb from "@/components/common/BreadCrumb";
import { fetchUserFromApiServer } from "../../actions/userServerActions";
import { BREADCRUMB_ITEMS } from "@/utils/constants";


export default function MyProfilePage() {

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={BREADCRUMB_ITEMS.HOME} />
      <PageTile title={"My Profile"} />
      <ProfileDetails userProfilePromise={fetchUserFromApiServer("me")} />
    </main>
  );
};
