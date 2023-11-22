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
  return (
    <div id="content">
      <TokenRequestModal />
      <TokenResponseModal
        refreshToken={cookies().get(AuthCookies.REFRESH_TOKEN)?.value ?? ''}
        clientId={cookies().get(AuthCookies.CLIENT_ID)?.value ?? ''}
        clientSecret={cookies().get(AuthCookies.CLIENT_SECRET)?.value ?? ''}
      />
    </div>
  );
};
