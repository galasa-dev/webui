/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageTile from "@/components/PageTile";
import ProfileDetails from "@/components/profile/ProfileDetails";
import BreadCrumb from "@/components/common/BreadCrumb";
import { fetchUserFromApiServer } from "../../actions/userServerActions";
import { HOME } from "@/utils/constants/breadcrumb";

export default function MyProfilePage() {
  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile translationKey={"MyProfilePage.title"} />
      <ProfileDetails userProfilePromise={fetchUserFromApiServer("me")} />
    </main>
  );
}
