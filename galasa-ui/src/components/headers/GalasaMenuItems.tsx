/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { HeaderMenuItem } from '@carbon/react';
import { useFeatureFlags } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '@/utils/featureFlags';
import { useTranslations } from 'next-intl';

export default function GalasaMenuItems() {
  const { isFeatureEnabled } = useFeatureFlags();
  const translations = useTranslations('PageHeader');

  return (
    <>
      <HeaderMenuItem href="/users">{translations('users')}</HeaderMenuItem>
      {isFeatureEnabled(FEATURE_FLAGS.TEST_RUNS) && (
        <HeaderMenuItem href="/test-runs">{translations('testRuns')}</HeaderMenuItem>
      )}
    </>
  );
}
