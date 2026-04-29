/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import AccessTokensSection from '@/components/mysettings/AccessTokensSection';
import TokenResponseModal from '@/components/tokens/TokenResponseModal';
import PageTile from '@/components/PageTile';
import { ConfigurationPropertyStoreAPIApi, UsersAPIApi } from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import * as Constants from '@/utils/constants/common';
import BreadCrumb from '@/components/common/BreadCrumb';
import { fetchAccessTokens } from '../../actions/getUserAccessTokens';
import ErrorPage from '../error/page';
import ExperimentalFeaturesSection from '@/components/mysettings/ExperimentalFeaturesSection';
import { HOME } from '@/utils/constants/breadcrumb';
import { fetchUserFromApiServer } from '@/actions/userServerActions';
import ProfileRole from '@/components/users/UserRole';
import DateTimeSettings from '@/components/mysettings/DateTimeSettings';
import ResultsTablePageSizeSetting from '@/components/mysettings/ResultsTablePageSizeSetting';

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

export default async function MySettings() {
  const apiConfig = createAuthenticatedApiConfiguration();

  const clientId = (await cookies()).get(AuthCookies.CLIENT_ID)?.value ?? '';
  const refreshToken = (await cookies()).get(AuthCookies.REFRESH_TOKEN)?.value ?? '';

  // Server Action to delete auth-related cookies
  const deleteCookies = async () => {
    'use server';

    (await cookies()).delete(AuthCookies.CLIENT_ID);
    (await cookies()).delete(AuthCookies.REFRESH_TOKEN);
  };

  const fetchUserLoginId = async () => {
    const usersApiClient = new UsersAPIApi(apiConfig);
    const userResponse = await usersApiClient.getUserByLoginId(Constants.CLIENT_API_VERSION, 'me');

    let loginId: string | undefined;
    if (userResponse.length > 0) {
      loginId = userResponse[0].loginId;
      if (!loginId) {
        throw new Error('Unable to get current user ID from the Galasa API server');
      }
    }
    return loginId;
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

  // Await the login ID before using it
  const userLoginId = await fetchUserLoginId();

  if (!userLoginId) {
    return <ErrorPage />;
  }

  const tokenExpiryWarningConfiguration = await fetchTokenExpiryWarningConfiguration();

  return (
    <main id="content">
      <BreadCrumb breadCrumbItems={[HOME]} />
      <PageTile translationKey="MySettings.title" />
      <ProfileRole userProfilePromise={fetchUserFromApiServer('me')} />
      <AccessTokensSection
        accessTokensPromise={fetchAccessTokens(userLoginId)}
        isAddBtnVisible={true}
        tokenExpiryWarningDays={tokenExpiryWarningConfiguration.warningDays}
        showMaxWarningDaysNotice={tokenExpiryWarningConfiguration.exceededMaximum}
      />
      <TokenResponseModal refreshToken={refreshToken} clientId={clientId} onLoad={deleteCookies} />
      <DateTimeSettings />
      <ResultsTablePageSizeSetting />
      <ExperimentalFeaturesSection />
    </main>
  );
}
