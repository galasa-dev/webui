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

interface BreadCrumbProps {
  title: string;
  route: string;
}

function BreadCrumb({
  breadCrumbItems,
}: {
  breadCrumbItems: BreadCrumbProps[];
}) {
  const translations = useTranslations("Breadcrumb");
  const theme = useTheme().theme === "g100" ? "g90" : "g10"; // Adjust theme comparison
  return (
    <Theme theme={theme}>
      <Breadcrumb className={styles.crumbContainer}>
        {breadCrumbItems.map((item, idx) => {
          return (
            <BreadcrumbItem key={idx} isCurrentPage={false} href={item.route}>
              {translations(item.title)}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    </Theme>
  );
}

export default BreadCrumb;
