/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React from 'react';
import { HeaderGlobalBar, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { User } from "@carbon/icons-react";
import { useRouter } from 'next/navigation';

function PageHeaderMenu() {

  const router = useRouter();

  const handleDeleteCookieApiOperation = async () => {

    const response = await fetch('/users', { method: 'DELETE' });

    if (response.status === 204) {

      //auto redirect to render dex login page
      router.refresh();

    }
  };

  const handleRedirectToMyProfilePage = () => {
    router.push("/myprofile");
  };

  const handleRedirectToMySettingsPage = () => {
    router.push("/mysettings");
  };

  return (
    <HeaderGlobalBar data-testid="header-menu">

      <OverflowMenu
        data-floating-menu-container
        selectorPrimaryFocus={'.optionOne'}
        renderIcon={User}
        data-testid='menu-btn'
        size='lg'
        flipped={true}
      >
        <OverflowMenuItem
          itemText="My Profile"
          data-testid='my-profile-btn'
          onClick={handleRedirectToMyProfilePage}
        />
        <OverflowMenuItem
          itemText="My Settings"
          data-testid='my-settings-btn'
          onClick={handleRedirectToMySettingsPage}
        />
        <OverflowMenuItem
          itemText="Log out"
          onClick={handleDeleteCookieApiOperation}
          data-testid='logout-btn'
        />

      </OverflowMenu>

    </HeaderGlobalBar>
  );
}

export default PageHeaderMenu;