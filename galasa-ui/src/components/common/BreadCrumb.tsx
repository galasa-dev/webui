/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React from 'react';
import { Breadcrumb, BreadcrumbItem, OverflowMenuItem, OverflowMenu, Theme } from "@carbon/react";
import "@/styles/global.scss";
import styles from "@/styles/BreadCrumb.module.css";
import { useTranslations } from 'next-intl';
import { useTheme } from '@/contexts/ThemeContext';
import { BreadCrumbProps } from '@/utils/interfaces/components';
import { useRouter } from 'next/navigation';

function BreadCrumb({
  breadCrumbItems,
}: {
  breadCrumbItems: BreadCrumbProps[];
}) {
  const translations = useTranslations("Breadcrumb");
  const current = useTheme().theme;
  const router = useRouter();
  let theme: 'g10' | 'g90';

 const BREADCRUMB_THRESHOLD = 4;

  if (current === 'light') {
    theme = 'g10';
  } else if (current === 'dark') {
    theme = 'g90';
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme = 'g90';
  } else {
    theme = 'g10';
  }

  // Helper to render a single breadcrumb item correctly
  const renderItem = (item: BreadCrumbProps, isCurrent: boolean) => {
    const translatedTitle = translations(item.title, item.values);
    const displayText = translatedTitle.startsWith("Breadcrumb.") ? item.title : translatedTitle;
    return (
      <BreadcrumbItem
        href={isCurrent ? undefined : item.route}
        isCurrentPage={isCurrent}
      >
        {displayText}
      </BreadcrumbItem>
    );
  }

  const renderOverflowItems = (items: BreadCrumbProps[]) => {
    return items.map((item) => {
      const translatedTitle = translations(item.title, item.values);
      const displayText = translatedTitle.startsWith("Breadcrumb.") ? item.title : translatedTitle;
      
      return (
        <OverflowMenuItem
          itemText={displayText} 
          onClick={() => router.push(item.route)}
        />
      )
    })
  }

  return (
    <Theme theme={theme}>
      <Breadcrumb className={styles.crumbContainer} noTrailingSlash>
        {
          breadCrumbItems.length <= BREADCRUMB_THRESHOLD ? (
            breadCrumbItems.map((item, idx) => (
              <React.Fragment key={idx}>
                {renderItem(item, false)}
              </React.Fragment>
            ))
          ) : 
          <>
            {/* Render the first and second items */}
            {renderItem(breadCrumbItems[0], false)}
            {renderItem(breadCrumbItems[1], false)}

            {/* Render the overflow menu with the middle terms */}
            <BreadcrumbItem>
              <OverflowMenu 
                align="bottom"
                aria-label="More navigation links" 
              >
                {renderOverflowItems(breadCrumbItems.slice(2, -2))}
              </OverflowMenu>
            </BreadcrumbItem>

            {/* Render the last 2 items */}
            {renderItem(breadCrumbItems[breadCrumbItems.length - 2], false)}
            {renderItem(breadCrumbItems[breadCrumbItems.length - 1], false)}
          </>
        }
      </Breadcrumb>
    </Theme>
  );
}

export default BreadCrumb;
