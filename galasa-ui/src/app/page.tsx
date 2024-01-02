/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import TokenRequestModal from '@/components/TokenRequestModal';
import TokenResponseModal from '@/components/TokenResponseModal';
import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';

export default function HomePage() {

  const clientId = cookies().get(AuthCookies.CLIENT_ID)?.value ?? '';
  const clientSecret = cookies().get(AuthCookies.CLIENT_SECRET)?.value ?? '';
  const refreshToken = cookies().get(AuthCookies.REFRESH_TOKEN)?.value ?? '';

  // Server Action to delete auth-related cookies
  const deleteCookies = async () => {
    'use server';

    cookies().delete(AuthCookies.CLIENT_ID);
    cookies().delete(AuthCookies.CLIENT_SECRET);
    cookies().delete(AuthCookies.REFRESH_TOKEN);
  };

  return (
    <div id="content">
      <TokenRequestModal />
      <TokenResponseModal refreshToken={refreshToken} clientId={clientId} clientSecret={clientSecret} onLoad={deleteCookies} />
    </div>
  );
};
