/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { HeaderMenuItem } from '@carbon/react';
import { useTranslations } from 'next-intl';

export default function GalasaMenuItems() {
  const translations = useTranslations('PageHeader');

  return (
    <>
      <HeaderMenuItem href="/users">{translations('users')}</HeaderMenuItem>
      <HeaderMenuItem href="/test-runs">{translations('testRuns')}</HeaderMenuItem>
    </>
  );
}
