/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import React, { useState, useTransition } from 'react';
import { Dropdown } from '@carbon/react';
import { setUserLocale } from '@/utils/locale';
import styles from '@/styles/Selector.module.css';
import { useLocale, useTranslations } from 'next-intl';
import { Locale } from '@/i18n/config';
import { useRouter } from 'next/navigation';

const languages = [
  { id: 'en', text: 'English', value: 'en' },
  { id: 'de', text: 'Deutsch', value: 'de' },
];

export default function LanguageSelector() {
  const locale = useLocale();
  const [selectedLanguage, setSelectedLanguage] = useState(
    languages.find((lang) => lang.value === locale) || languages[0]
  );

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const translations = useTranslations('LanguageSelector');

  const handleLanguageChange = ({
    selectedItem,
  }: {
    selectedItem: { id: string; text: string; value: string };
  }) => {
    if (!selectedItem) return;
    setSelectedLanguage(selectedItem);

    startTransition(() => {
      const newLocale = selectedItem.value as Locale;
      setUserLocale(newLocale); // sets the cookie
      router.refresh(); // refreshes to apply new locale
    });
  };

  return (
    <div className={styles.container}>
      <span className={styles.icon}>{translations('label')} :</span>
      <Dropdown
        id="language-selector"
        items={languages}
        onChange={handleLanguageChange}
        selectedItem={selectedLanguage}
        label="Select language"
        itemToString={(item: { id: string; text: string; value: string } | null) =>
          item?.text || ''
        }
        size="sm"
        className={styles.dropdown}
        disabled={isPending}
      />
    </div>
  );
}
