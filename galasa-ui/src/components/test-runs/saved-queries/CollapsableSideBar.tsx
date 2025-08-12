'use client';

import { useState } from 'react';
import { SideNav, SideNavItems, SideNavLink, IconButton } from '@carbon/react';
import { ChevronLeft, ChevronRight, StarFilled, Query } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/CollapsableSideBar.module.css';

export default function CollapsableSideBar() {
  const [isExpanded, setIsExpanded] = useState(true);

  const activeHref = '#';

  return (
    <div>
      <SideNav className={styles.sideNav} aria-label="Saved Queries Sidebar" isRail>
        <SideNavItems>
          {/* Default/Starred Item */}
          <SideNavLink renderIcon={StarFilled} href="#" isActive={activeHref === '#'}>
            Tests ran in last 24 hours
          </SideNavLink>

          {/* Other Saved Queries */}
          <SideNavLink renderIcon={Query} href="#">
            My Team's Smoke Tests
          </SideNavLink>
          <SideNavLink renderIcon={Query} href="#">
            Failed Runs - Last 7 Days
          </SideNavLink>
          <SideNavLink renderIcon={Query} href="#">
            Production Deployments
          </SideNavLink>
        </SideNavItems>
      </SideNav>
    </div>
  );
}
