/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import {
  Header,
  HeaderName,
  SkipToContent,
  Theme,
  HeaderNavigation,
  HeaderMenuItem,
} from '@carbon/react';
import PageHeaderMenu from './PageHeaderMenu';
import Image from 'next/image';
import galasaLogo from '@/assets/images/galasaLogo.png';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '@/utils/featureFlags';
import { useTranslations } from 'next-intl';
import { SideNav } from '@carbon/react';
import { SideNavItems } from '@carbon/react';
import { HeaderSideNavItems } from '@carbon/react';
import { HeaderMenuButton } from '@carbon/react';
import { useState } from 'react';
import styles from '@/styles/headers/PageHeader.module.css';

export default function PageHeader({ galasaServiceName }: { galasaServiceName: string }) {
  const { isFeatureEnabled } = useFeatureFlags();
  const translations = useTranslations('PageHeader');
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);

  const onClickSideNavExpand = () => {
    setIsSideNavExpanded(!isSideNavExpanded);
  };

  return (
    <Theme theme="g90">
      <Header aria-label="Galasa Ecosystem">
        <SkipToContent />
        <HeaderMenuButton
          aria-label={isSideNavExpanded ? 'Close menu' : 'Open menu'}
          onClick={onClickSideNavExpand}
          isActive={isSideNavExpanded}
          aria-expanded={isSideNavExpanded}
        />

        <HeaderName href="/" prefix="">
          <span className={styles.headerName} aria-label="Header name">
            <Image src={galasaLogo} width={28} height={28} alt="Galasa logo" /> Galasa
          </span>
        </HeaderName>

        <HeaderNavigation aria-label="Galasa menu bar navigation">
          <HeaderMenuItem href="/users">{translations('users')}</HeaderMenuItem>
          {isFeatureEnabled(FEATURE_FLAGS.TEST_RUNS) && (
            <HeaderMenuItem href="/test-runs">{translations('testRuns')}</HeaderMenuItem>
          )}
        </HeaderNavigation>

        <SideNav
          aria-label="Side navigation"
          expanded={isSideNavExpanded}
          isPersistent={false}
          onSideNavBlur={onClickSideNavExpand}
        >
          <SideNavItems>
            <HeaderSideNavItems>
              <HeaderMenuItem href="/users">{translations('users')}</HeaderMenuItem>
              {isFeatureEnabled(FEATURE_FLAGS.TEST_RUNS) && (
                <HeaderMenuItem href="/test-runs">{translations('testRuns')}</HeaderMenuItem>
              )}
            </HeaderSideNavItems>
          </SideNavItems>
        </SideNav>

        <PageHeaderMenu galasaServiceName={galasaServiceName} />
      </Header>
    </Theme>
  );
}
