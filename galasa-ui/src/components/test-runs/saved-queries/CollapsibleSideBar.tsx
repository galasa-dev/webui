/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useState } from 'react';
import { HeaderMenuButton, SideNavItems } from '@carbon/react';
import styles from '@/styles/test-runs/saved-queries/CollapsibleSideBar.module.css';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import QueryItem from './QueryItem';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';

export default function CollapsibleSideBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: Get saved queries from a custom hook that stores them in localStorage
  const { savedQueries, setSavedQueries } = useSavedQueries();

  const getQueryPosition = (createdAt: string) =>
    savedQueries.findIndex((query) => query.createdAt === createdAt);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const originalPosition = getQueryPosition(String(active.id));
      const newPosition = getQueryPosition(String(over.id));
      setSavedQueries(arrayMove(savedQueries, originalPosition, newPosition));
    }
  };

  // All sensors used for drag and drop functionality (Pointer, Touch, and Keyboard)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className={styles.container} aria-label="Saved Queries Header">
      <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCorners}>
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
            <SortableContext
              items={savedQueries.map((query) => query.createdAt)}
              strategy={verticalListSortingStrategy}
            >
              {savedQueries.map((query) => (
                <QueryItem query={query} key={query.createdAt} />
              ))}
            </SortableContext>
          </SideNavItems>
        </div>
      </DndContext>
    </div>
  );
}
