/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Header, HeaderName, SkipToContent, Theme, HeaderNavigation, HeaderMenuItem } from '@carbon/react';
import PageHeaderMenu from "./PageHeaderMenu";
import Image from 'next/image';
import galasaLogo from "@/assets/images/galasaLogo.png";
import Link from 'next/link';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import {FEATURE_FLAGS} from '@/utils/featureFlags';
import { useTranslations } from 'next-intl';

export default function PageHeader({ galasaServiceName }: { galasaServiceName: string }) {
  const {isFeatureEnabled} = useFeatureFlags();
  const t = useTranslations('PageHeader');

  return (
    <Theme theme="g90">
      <Header aria-label="Galasa Ecosystem">

        <SkipToContent />

        <Link href={"/"} style={{"paddingLeft" : "0.5rem"}}>
          <Image
            src={galasaLogo}
            width={28}
            height={28}
            alt='Galasa logo'
          />
        </Link>

        <HeaderName href="/" prefix="">Galasa</HeaderName>
        
        <HeaderNavigation aria-label="Galasa menu bar navigation">
          <HeaderMenuItem href="/users">{t('users')}</HeaderMenuItem>
          {isFeatureEnabled(FEATURE_FLAGS.TEST_RUNS) && (<HeaderMenuItem href="/test-runs">{t("testRuns")}</HeaderMenuItem>)}
        </HeaderNavigation>
     

        <PageHeaderMenu galasaServiceName={galasaServiceName} />

      </Header>
    </Theme>
  );

};