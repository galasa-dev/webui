/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
// Stop this route from being pre-rendered
export const dynamic = 'force-dynamic';

import { getAuthorizationUrl, getOpenIdClient } from '@/utils/auth';
import { redirect } from 'next/navigation';

// GET request handler for requests to /auth
export async function GET() {
  const callbackUrl = `${process.env.WEBUI_HOST_URL}/auth/callback`;

  const openIdClient = await getOpenIdClient('galasa-webui', `${process.env.DEX_CLIENT_SECRET}`, callbackUrl);
  const authUrl = getAuthorizationUrl(openIdClient);

  redirect(authUrl);
}
