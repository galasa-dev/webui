/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import TokenRequestModal from '@/components/TokenRequestModal';
import TokenResponseModal from '@/components/TokenResponseModal';
import { cookies } from 'next/headers';

export default function HomePage() {
  return (
    <div id="content">
      <TokenRequestModal />
      <TokenResponseModal
        refreshToken={cookies().get('refresh_token')?.value ?? ''}
        clientId={cookies().get('client_id')?.value ?? ''}
        clientSecret={cookies().get('client_secret')?.value ?? ''}
      />
    </div>
  );
};
