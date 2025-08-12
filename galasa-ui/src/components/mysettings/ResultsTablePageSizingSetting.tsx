/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { RESULTS_TABLE_PAGE_SIZES } from '@/utils/constants/common';
import { Dropdown } from '@carbon/react';
import { useTranslations } from 'next-intl';

export default function ResultsTablePageSizingSetting() {
  const translations = useTranslations('ResultsTablePageSizingSetting');
  return (
    <section>
      <h3>{translations('title')}</h3>
      <div>
        <p>{translations('description')}</p>
        <div>
          <p>{translations('defaultTestRunsLabel')}</p>
          <Dropdown
            data-testid="custom-items-per-page-dropdown-test"
            items={RESULTS_TABLE_PAGE_SIZES}
            itemToString={(item: number) => item.toString()}
            // selectedItem={RESULTS_TABLE_PAGE_SIZES.find(
            //   (item) => item === preferences.itemsPerPage
            // )}
            // onChange={(e: { selectedItem: number }) =>

            // }
            size="md"
          />
        </div>
      </div>
    </section>
  );
}
