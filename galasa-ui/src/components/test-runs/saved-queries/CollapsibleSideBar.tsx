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
import { SavedQueryType } from '@/utils/types/common';
import QueryItem from './QueryItem';

const mockedQueries = [
  {
    createdAt: '2023-03-01T12:00:00Z',
    title: 'Tests ran in the last 24 hours',
    url: 'http://localhost:3000/test-runs?q=N4IgLiBc4GYgNCAbgYyiAzgQXgJwHZ4CO8YAphmAMoAWA9rmAHICGAtmfJXhgiCnXTY8hXCQwBLACbwA5vABG8AA6kK1eo1YdShbmFkYefKQFdcLMBLr50AdngAGJyAC+QA',
  },
  {
    createdAt: '2023-03-02T12:00:00Z',
    title: 'Failed Runs - Last 7 Days',
    url: 'http://localhost:3000/test-runs?q=N4IgLiBcIE4gNCAbgYyiAzgQXjAdrgI7xgCmGYAygBYD2MYAcgIYC2p8FuGCIKt6bLgIxiGAJYATeAHN4AI3gAHEuSp0GLdiQJcwMjN16SArjGZhxtPOgCc8AAzwAjCAC+QA',
  },
  {
    createdAt: '2023-03-03T12:00:00Z',
    title: 'Cancelled Runs - Last 7 Days',
    url: 'http://localhost:3000/test-runs?q=N4IgLiBcIE4gNCAbgYyiAzgQXjAdrgI7xgCmGYAygBYD2MYAcgIYC2p8FuGCIKt6bLgIxiGAJYATeAHN4AI3gAHEuSp0GLdiQJcwMjN14AzdK0kAPGdVYBWNIjADo7ZvOoArUgEYQAXyA',
  },
];

export default function CollapsibleSideBar() {
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: Get saved queries from a custom hook that stores them in localStorage
  const [savedQueries, setSavedQueries] = useState<SavedQueryType[]>(mockedQueries);
  const [defaultQuery, setDefaultQuery] = useState<SavedQueryType | null>(null);

  const getQueryPosition = (createdAt: string) =>
    savedQueries.findIndex((query) => query.createdAt === createdAt);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSavedQueries((queries) => {
        const originalPosition = getQueryPosition(String(active.id));
        const newPosition = getQueryPosition(String(over.id));
        return arrayMove(queries, originalPosition, newPosition);
      });
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
    <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCorners}>
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
      </div>
    </DndContext>
  );
}
