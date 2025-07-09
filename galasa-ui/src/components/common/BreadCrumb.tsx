/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbItem, Theme } from "@carbon/react";
import "@/styles/global.scss";
import styles from "@/styles/BreadCrumb.module.css";
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { BreadCrumbProps } from '@/utils/interfaces/components';

function BreadCrumb({
  breadCrumbItems,
}: {
  breadCrumbItems: BreadCrumbProps[];
}) {
  const translations = useTranslations("Breadcrumb");
  const current = useTheme().theme;
  let theme: 'g10' | 'g90';

  if (current === 'light') {
    theme = 'g10';
  } else if (current === 'dark') {
    theme = 'g90';
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'g90';
  } else {
    theme = 'g10';
  }

  return (
    <Theme theme={theme}>
      <Breadcrumb className={styles.crumbContainer}>
        {breadCrumbItems.map((item, idx) => {
          const translatedTitle = translations(item.title, item.values);
          const displayText = translatedTitle.startsWith("Breadcrumb.") ? item.title : translatedTitle; 
          return (
            <BreadcrumbItem key={idx} isCurrentPage={false} href={item.route}>
              {displayText}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Theme>
  );
}

export default BreadCrumb;
