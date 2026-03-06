/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import breadcrumbStyles from '@/styles/common/BreadCrumb.module.css';
import testRunsStyles from '@/styles/test-runs/TestRunsPage.module.css';
import footerStyles from '@/styles/Footer.module.css';

export function getHeightOfHeaderAndFooter(): number {
  const classNames = [
    'cds--header__global',
    breadcrumbStyles.crumbContainer,
    testRunsStyles.toolbar,
    footerStyles.footer,
  ];

  let totalHeight = 0;

  classNames.forEach((className) => {
    const elements = document.getElementsByClassName(className);

    // Iterate through all elements with this class name
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLElement;
      // Get the offsetHeight which includes padding and border
      totalHeight += element.offsetHeight;
      console.log('Hello ' + className + ': ' + element.offsetHeight);
    }
  });
  console.log('Hello ' + totalHeight);
  return totalHeight;
}
