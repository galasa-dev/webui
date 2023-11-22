/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { SideNav, SideNavItems, SideNavItem} from '@carbon/react';

export default function Sidebar (){
  return (
    <SideNav aria-label="Sidebar">
      <SideNavItems>
        <SideNavItem >Token Management</SideNavItem>
        <SideNavItem >You are logged in as:</SideNavItem>
        <SideNavItem >Previous login</SideNavItem>
        <SideNavItem >Your access roles:</SideNavItem>
      </SideNavItems>
    </SideNav>
  );
};