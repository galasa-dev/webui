/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageTile from "@/components/PageTile";
import ProfileDetails from "@/components/profile/ProfileDetails";
import BreadCrumb from "@/components/common/BreadCrumb";
import { fetchUserFromApiServer } from "../../actions/userServerActions";
import { useTranslations } from "next-intl";


export default function MyProfilePage() {
  const t= useTranslations('MyProfilePage');

  return (
    <main id="content">
      <BreadCrumb />
      <PageTile title={t("title")} />
      <ProfileDetails userProfilePromise={fetchUserFromApiServer("me")} />
    </main>
  );
};
