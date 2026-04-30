/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import PageTile from '@/components/PageTile';
import UserRoleSection from '@/components/users/UserRoleSection';
import {
  ConfigurationPropertyStoreAPIApi,
  RBACRole,
  RoleBasedAccessControlAPIApi,
} from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import AccessTokensSection from '@/components/mysettings/AccessTokensSection';
import { fetchAccessTokens } from '@/actions/getUserAccessTokens';
import { fetchUserFromApiServer } from '@/actions/userServerActions';
import BreadCrumb from '@/components/common/BreadCrumb';
import { EDIT_USER, HOME } from '@/utils/constants/breadcrumb';
import * as Constants from '@/utils/constants/common';

// In order to extract query param on server-side
type UsersPageProps = {
  params: Promise<{}>; // No dynamic route parameters
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const getValidatedWarningDays = (value?: string) => {
  const parsedValue = Number.parseInt(value ?? '', 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0) {
    return {
      warningDays: Constants.DEFAULT_ACCESS_TOKEN_EXPIRY_WARNING_DAYS,
      exceededMaximum: false,
    };
  }

  if (parsedValue > Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS) {
    return {
      warningDays: Constants.MAX_ACCESS_TOKEN_EXPIRY_WARNING_DAYS,
      exceededMaximum: true,
    };
  }

  return {
    warningDays: parsedValue,
    exceededMaximum: false,
  };
};

export default async function EditUserPage(props: UsersPageProps) {
  const searchParams = await props.searchParams;
  const loginIdFromQueryParam = searchParams.loginId as string;

  const apiConfig = createAuthenticatedApiConfiguration();

  const fetchRBACRolesFromApiServer = async () => {
    let roles: RBACRole[] = [];

    const rbacApiClient = new RoleBasedAccessControlAPIApi(apiConfig);
    const rolesReponse = await rbacApiClient.getRBACRoles();

    if (rolesReponse && rolesReponse.length >= 1) {
      roles = structuredClone(rolesReponse);
    }

    return roles;
  };

  const fetchTokenExpiryWarningConfiguration = async () => {
    try {
      const cpsApiClientWithAuthHeader = new ConfigurationPropertyStoreAPIApi(apiConfig);
      const warningPropertyResponse = await cpsApiClientWithAuthHeader.getCpsProperty(
        Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAMESPACE,
        Constants.ACCESS_TOKEN_EXPIRY_WARNING_PROPERTY_NAME
      );

      const warningPropertyValue = warningPropertyResponse?.[0]?.data?.value;
      return getValidatedWarningDays(warningPropertyValue);
    } catch (error) {
      return getValidatedWarningDays();
    }
  };

  const tokenExpiryWarningConfiguration = await fetchTokenExpiryWarningConfiguration();

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME, EDIT_USER]} />
      <PageTile translationKey={'UserEditPage.title'} />
      <UserRoleSection
        userProfilePromise={fetchUserFromApiServer(loginIdFromQueryParam)}
        roleDetailsPromise={fetchRBACRolesFromApiServer()}
      />
      <AccessTokensSection
        accessTokensPromise={fetchAccessTokens(loginIdFromQueryParam)}
        isAddBtnVisible={false}
        tokenExpiryWarningDays={tokenExpiryWarningConfiguration.warningDays}
        showMaxWarningDaysNotice={tokenExpiryWarningConfiguration.exceededMaximum}
      />
    </main>
  );
}
