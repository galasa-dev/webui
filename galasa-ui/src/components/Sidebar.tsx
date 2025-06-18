/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { SideNav, SideNavItems, SideNavItem} from '@carbon/react';
import { useTranslations } from 'next-intl';

export default function Sidebar (){
  const translations = useTranslations('Sidebar');
  return (
    <SideNav aria-label="Sidebar">
      <SideNavItems>
        <SideNavItem>{translations('tokenManagement')}</SideNavItem>
        <SideNavItem>{translations('loggedInAs')}</SideNavItem>
        <SideNavItem>{translations('previousLogin')}</SideNavItem>
        <SideNavItem>{translations('accessRoles')}</SideNavItem>
      </SideNavItems>
    </SideNav>
  );
};