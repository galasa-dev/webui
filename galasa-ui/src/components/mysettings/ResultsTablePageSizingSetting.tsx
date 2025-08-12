/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { RESULTS_TABLE_PAGE_SIZES } from '@/utils/constants/common';
import { Dropdown } from '@carbon/react';
import { useTranslations } from 'next-intl';
import styles from '@/styles/mysettings/ResultsTablePageSizingSetting.module.css';

export default function ResultsTablePageSizingSetting() {
  const translations = useTranslations('ResultsTablePageSizingSetting');
  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>{translations('title')}</h3>
      <div>
        <p className={styles.title}>{translations('description')}</p>
        <div className={styles.dropdownContainer}>
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
