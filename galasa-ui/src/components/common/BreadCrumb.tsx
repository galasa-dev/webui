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

interface BreadCrumbProps {

  title: string;
  route: string;

}

function BreadCrumb({breadCrumbItems} : {breadCrumbItems : BreadCrumbProps[]}) {

  return (
    <Theme theme="g10">
      <Breadcrumb className={styles.crumbContainer}>
        {
          breadCrumbItems.map((item, idx) => {
            return (
              <BreadcrumbItem key={idx} isCurrentPage={false} href={item.route}>{item.title}</BreadcrumbItem>
            );
          })
        }
      </Breadcrumb>
    </Theme>
  );
}

export default BreadCrumb;