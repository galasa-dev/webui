/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Menu } from "@carbon/icons-react";
import { useRouter } from "next/navigation";

export default function LeftHeaderMenu() {

  const router = useRouter();

  const handleRedirectToHome = () => {
    router.push("/");
  };

  return (

    <OverflowMenu
      data-floating-menu-container
      selectorPrimaryFocus={'.optionOne'}
      renderIcon={Menu}
      data-testid='left-menu-btn'
      size='lg'
      flipped={false}
    >
      <OverflowMenuItem
        itemText="Home"
        data-testid='home-btn'
        onClick={handleRedirectToHome}
      />
    </OverflowMenu>

  );
}