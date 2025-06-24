/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { getClientApiVersion, getServiceHealthStatus } from '@/utils/health';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import Footer from '@/components/Footer';
import PageHeader from '@/components/headers/PageHeader';
import '@/styles/global.scss';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { cookies } from 'next/headers';
import FeatureFlagCookies from '@/utils/featureFlagCookies';
import { getLocale } from 'next-intl/server';
import { ThemeProvider } from '@/contexts/ThemeContext';

export const dynamic = "force-dynamic";
type ThemeType = "white" | "g100"; 

export default async function RootLayout({children,}: {children: React.ReactNode}) {
  // Ensure that the incoming `locale` is valid
  const locale = await getLocale();
 
  const galasaServiceName = process.env.GALASA_SERVICE_NAME?.trim() || "Galasa Service";
  const featureFlagsCookie = cookies().get(FeatureFlagCookies.FEATURE_FLAGS)?.value;
  const themeCookie = cookies().get('theme')?.value;
  const initialTheme = ['white','g10','g90','g100'].includes(themeCookie || '') 
    ? themeCookie! 
    : 'white';

  return (
    <html lang={locale}>
      <head>
        <title>{galasaServiceName}</title>
        <meta name="description" content="Galasa Ecosystem Web UI" />
      </head>
      <body data-carbon-theme={initialTheme}>
        <NextIntlClientProvider>
          <FeatureFlagProvider initialFlags={featureFlagsCookie}>
            <ThemeProvider initialTheme={initialTheme as ThemeType}>
              <PageHeader galasaServiceName={galasaServiceName} />
              {children}
              <Footer serviceHealthyPromise={getServiceHealthStatus()} clientVersionPromise={getClientApiVersion()}/>
            </ThemeProvider>
          </FeatureFlagProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

