/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React from 'react';
import { HeaderGlobalBar, OverflowMenu, OverflowMenuItem, HeaderName } from '@carbon/react';
import { User } from "@carbon/icons-react";
import { useRouter } from 'next/navigation';
import { handleDeleteCookieApiOperation } from '@/utils/logout';
import LanguageSelector from './LanguageSelector';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '@/utils/featureFlags';
import { useTranslations } from 'next-intl';
import { setUserLocale } from '@/utils/locale';

function PageHeaderMenu({ galasaServiceName }: { galasaServiceName: string }) {
  const translations = useTranslations('PageHeaderMenu');

  const router = useRouter();

  const handleRedirectToMyProfilePage = () => {
    router.push("/myprofile");
  };

  const handleRedirectToMySettingsPage = () => {
    router.push("/mysettings");
  };
  const {isFeatureEnabled} = useFeatureFlags();
  
  if(!isFeatureEnabled(FEATURE_FLAGS.INTERNATIONALIZATION)) {
    setUserLocale("en");
  }
  return (
    <HeaderGlobalBar data-testid="header-menu">

      {isFeatureEnabled(FEATURE_FLAGS.INTERNATIONALIZATION) && ( <LanguageSelector/>)}
      <HeaderName prefix="">{galasaServiceName}</HeaderName>
      <OverflowMenu
        data-floating-menu-container
        selectorPrimaryFocus={'.optionOne'}
        renderIcon={User}
        data-testid='menu-btn'
        size='lg'
        flipped={true}
      >
        <OverflowMenuItem
          itemText={translations('profile')}
          data-testid='my-profile-btn'
          onClick={handleRedirectToMyProfilePage}
        />
        <OverflowMenuItem
          itemText={translations('settings')}
          data-testid='my-settings-btn'
          onClick={handleRedirectToMySettingsPage}
        />
        <OverflowMenuItem
          itemText={translations('logout')}
          onClick={() => handleDeleteCookieApiOperation(router)}
          data-testid='logout-btn'
        />

      </OverflowMenu>

    </HeaderGlobalBar>
  );
}

export default PageHeaderMenu;