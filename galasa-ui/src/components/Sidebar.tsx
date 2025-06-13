/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { SideNav, SideNavItems, SideNavItem} from '@carbon/react';
import { useTranslations } from 'next-intl';

export default function Sidebar (){
  const t = useTranslations('Sidebar');
  return (
    <SideNav aria-label="Sidebar">
      <SideNavItems>
        <SideNavItem>{t('tokenManagement')}</SideNavItem>
        <SideNavItem>{t('loggedInAs')}</SideNavItem>
        <SideNavItem>{t('previousLogin')}</SideNavItem>
        <SideNavItem>{t('accessRoles')}</SideNavItem>
      </SideNavItems>
    </SideNav>
  );
};