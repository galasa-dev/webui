/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import AuthCookies from '@/utils/authCookies';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  // an api route is made because, cookies are server side props and cannot be access directly on components
  // that use 'use client' keyword.

  cookies().delete(AuthCookies.ID_TOKEN);
  cookies().delete(AuthCookies.SHOULD_REDIRECT_TO_SETTINGS);

  return new NextResponse(null, { status: 204 });
}
