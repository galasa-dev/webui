/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useState } from 'react';
import { HeaderMenuButton, SideNavItems, SideNavLink } from '@carbon/react';
import { StarFilled, Query } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/CollapsibleSideBar.module.css';

export default function CollapsibleSideBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeHref = '#';

  return (
    <div className={styles.container} aria-label="Saved Queries Header">
      <HeaderMenuButton
        className={styles.headerMenuButton}
        aria-label="Open menu"
        isCollapsible
        isActive={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
      />
      <div
        className={isExpanded ? styles.sideNavExpanded : styles.sideNavCollapsed}
        aria-label="Saved Queries Sidebar"
      >
        <p className={styles.headerTitle}>Saved Queries</p>
        <SideNavItems>
          <SideNavLink renderIcon={StarFilled} href="#" isActive={activeHref === '#'}>
            Tests ran in the last 24 hours
          </SideNavLink>

          <SideNavLink renderIcon={Query} href="#">
            Failed Runs - Last 7 Days
          </SideNavLink>
          <SideNavLink renderIcon={Query} href="#">
            Cancelled Runs - Last 7 Days
          </SideNavLink>
        </SideNavItems>
      </div>
    </div>
  );
}
