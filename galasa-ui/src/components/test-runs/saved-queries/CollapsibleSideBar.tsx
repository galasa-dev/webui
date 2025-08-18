/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useMemo, useState } from 'react';
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
import { Search, Button, InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import useTestRunsQueryParams from '@/hooks/useTestRunsQueryParams';
import { useTranslations } from 'next-intl';
import { NotificationType } from '@/utils/types/common';
import { NOTIFICATION_VISIBLE_MILLISECS, TEST_RUNS_QUERY_PARAMS } from '@/utils/constants/common';

export default function CollapsibleSideBar() {
  const translations = useTranslations('CollapsibleSidebar');
  const { queryName, searchParams } = useTestRunsQueryParams();
  const { savedQueries, setSavedQueries, getQuery, saveQuery, isQuerySaved, defaultQuery } =
    useSavedQueries();
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter queries that can be sorted
  const sortableQueries = useMemo(() => {
    return savedQueries.filter((query) => query.createdAt !== defaultQuery.createdAt);
  }, [savedQueries, defaultQuery]);

  const getQueryPosition = (createdAt: string) =>
    sortableQueries.findIndex((query) => query.createdAt === createdAt);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const originalPosition = getQueryPosition(String(active.id));
      const newPosition = getQueryPosition(String(over.id));

      if (originalPosition === -1 || newPosition === -1) {
        return;
      }

      // Perform the array move ONLY on the sortable items.
      const reorderedSortableQueries = arrayMove(sortableQueries, originalPosition, newPosition);

      // Reconstruct the full list with the default query prepended.
      setSavedQueries([defaultQuery, ...reorderedSortableQueries]);
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

  const handleAddCurrentQuery = () => {
    const nameToSave = queryName.trim();

    // Do not save if the name is empty
    if (!nameToSave) return;

    const currentUrlParams = new URLSearchParams(searchParams);

    // Generate a unique title for the new query
    const baseName = nameToSave.replace(/\s*\(\d+\)$/, '').trim();
    let finalQueryTitle = nameToSave;
    let counter = 1;

    // Loop until it finds a title that is not already saved
    while (isQuerySaved(finalQueryTitle)) {
      finalQueryTitle = `${baseName} (${counter})`;
      counter++;
    }

    currentUrlParams.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, finalQueryTitle);
    const newQuery = {
      title: finalQueryTitle,
      url: currentUrlParams.toString(),
      createdAt: new Date().toISOString(),
    };

    saveQuery(newQuery);

    setNotification({
      kind: 'success',
      title: translations('newQuerySavedTitle'),
      subtitle: translations('newQuerySavedMessage', { name: finalQueryTitle }),
    });
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
  };

  // Filtered queries based on search term
  const filteredQueries = useMemo(() => {
    if (searchTerm) {
      return sortableQueries.filter((query) =>
        query.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return sortableQueries;
  }, [searchTerm, sortableQueries]);

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
          <div className={styles.toolbar}>
            <Search
              labelText="Search saved queries"
              placeHolder="Search saved queries"
              size="md"
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              onClear={() => setSearchTerm('')}
              className={styles.searchBar}
            />
            <Button
              kind="ghost"
              hasIconOnly
              renderIcon={Add}
              iconDescription="Add current query"
              onClick={handleAddCurrentQuery}
              tooltipPosition="top"
              className={styles.addButton}
            />
          </div>
          <SideNavItems>
            {defaultQuery && !searchTerm && (
              <QueryItem query={defaultQuery} key={defaultQuery.createdAt} disabled />
            )}

            <SortableContext
              items={filteredQueries.map((query) => query.createdAt)}
              strategy={verticalListSortingStrategy}
            >
              {filteredQueries.map((query) => (
                <QueryItem query={query} key={query.createdAt} />
              ))}
            </SortableContext>
          </SideNavItems>{' '}
          {notification && (
            <InlineNotification
              kind={notification.kind}
              title={notification.title}
              subtitle={notification.subtitle}
              onClose={() => setNotification(null)}
              className={styles.notification}
            />
          )}
        </div>
      </DndContext>
    </div>
  );
}
