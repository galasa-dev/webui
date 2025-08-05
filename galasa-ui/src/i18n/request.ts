/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { cookies } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '@/i18n/config';

const COOKIE_NAME = 'NEXT_LOCALE';

export default getRequestConfig(async () => {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME)?.value;

  const locale = locales.includes(cookieLocale as any)
    ? (cookieLocale as (typeof locales)[number])
    : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
