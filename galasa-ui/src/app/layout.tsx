/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import '@/styles/global.scss';
import { cookies } from 'next/headers';
import FeatureFlagCookies from '@/utils/featureFlagCookies';
import RootLayoutInner from './layout-inner';
import { getLocale, getMessages } from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';


export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  const galasaServiceName = process.env.GALASA_SERVICE_NAME?.trim() || "Galasa Service";
  const featureFlagsCookie = cookies().get(FeatureFlagCookies.FEATURE_FLAGS)?.value;
  const locale = await getLocale();
  const messages = await getMessages();
  
  return (
    <html lang={locale || "en"}>
      <NextIntlClientProvider locale={locale} messages={messages} >
        <RootLayoutInner
          galasaServiceName={galasaServiceName}
          featureFlagsCookie={featureFlagsCookie}
        > 
          {children}
        </RootLayoutInner>


      </NextIntlClientProvider>
    </html>
  );
}
