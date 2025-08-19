/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useMemo, useState } from 'react';
import { HeaderMenuButton, SideNavItems, Search, Button, InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
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
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import QueryItem from './QueryItem';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import useTestRunsQueryParams from '@/hooks/useTestRunsQueryParams';
import { useTranslations } from 'next-intl';
import { NotificationType, SavedQueryType } from '@/utils/types/common';
import { NOTIFICATION_VISIBLE_MILLISECS, TEST_RUNS_QUERY_PARAMS } from '@/utils/constants/common';

export default function CollapsibleSideBar() {
  const translations = useTranslations('CollapsibleSidebar');
  const { queryName, searchParams, setQueryName } = useTestRunsQueryParams();
  const { savedQueries, setSavedQueries, saveQuery, isQuerySaved, defaultQuery } =
    useSavedQueries();
  const [notification, setNotification] = useState<NotificationType | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // State to hold the data of the item currently being dragged for the DragOverlay
  const [activeQuery, setActiveQuery] = useState<SavedQueryType | null>(null);

  // Isolate user-sortable queries from the default query
  const sortableQueries = useMemo(
    () => savedQueries.filter((query) => query.createdAt !== defaultQuery.createdAt),
    [savedQueries, defaultQuery]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the full query object that is being dragged and store it in state
    const currentQuery = savedQueries.find((q) => q.createdAt === active.id);
    if (currentQuery) {
      setActiveQuery(currentQuery);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Clear the active query state to remove the overlay
    setActiveQuery(null);
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const getSortableQueryPosition = (createdAt: string) =>
        sortableQueries.findIndex((query) => query.createdAt === createdAt);
      const originalPosition = getSortableQueryPosition(String(active.id));
      const newPosition = getSortableQueryPosition(String(over.id));

      // Ensure we're only reordering valid sortable items
      if (originalPosition === -1 || newPosition === -1) return;

      const reorderedSortableQueries = arrayMove(sortableQueries, originalPosition, newPosition);
      setSavedQueries([defaultQuery, ...reorderedSortableQueries]);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddCurrentQuery = () => {
    const nameToSave = queryName.trim();
    if (!nameToSave) return;

    const currentUrlParams = new URLSearchParams(searchParams);
    let finalQueryTitle = nameToSave;

    if (isQuerySaved(finalQueryTitle)) {
      const baseName = nameToSave.replace(/\s*\(\d+\)$/, '').trim();
      let counter = 1;

      while (isQuerySaved(finalQueryTitle)) {
        finalQueryTitle = `${baseName} (${counter})`;
        counter++;
      }
    }

    currentUrlParams.set(TEST_RUNS_QUERY_PARAMS.QUERY_NAME, finalQueryTitle);
    const newQuery = {
      title: finalQueryTitle,
      url: currentUrlParams.toString(),
      createdAt: new Date().toISOString(),
    };

    saveQuery(newQuery);

    if (finalQueryTitle !== queryName) {
      setQueryName(finalQueryTitle);
    }

    setNotification({
      kind: 'success',
      title: translations('newQuerySavedTitle'),
      subtitle: translations('newQuerySavedMessage', { name: finalQueryTitle }),
    });
    setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);
  };

  // Filter only the sortable queries based on the search term
  const filteredSortableQueries = useMemo(() => {
    if (searchTerm) {
      return sortableQueries.filter((query) =>
        query.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return sortableQueries;
  }, [searchTerm, sortableQueries]);

  return (
    <div className={styles.container} aria-label="Saved Queries Header">
      <DndContext
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        sensors={sensors}
        collisionDetection={closestCorners}
      >
        <HeaderMenuButton
          className={styles.headerMenuButton}
          aria-label="Open menu"
          isCollapsible
          isActive={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        />

        <div className={styles.sidebarWrapper}>
          <div
            className={isExpanded ? styles.sideNavExpanded : styles.sideNavCollapsed}
            aria-label="Saved Queries Sidebar"
          >
            <div className={styles.innerContentWrapper}>
              <p className={styles.headerTitle}>Saved Queries</p>
              <div className={styles.toolbar}>
                <Search
                  labelText="Search saved queries"
                  placeholder="Search saved queries"
                  size="lg"
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  onClear={() => setSearchTerm('')}
                />
                <Button
                  kind="ghost"
                  hasIconOnly
                  renderIcon={Add}
                  iconDescription="Add current query"
                  onClick={handleAddCurrentQuery}
                  tooltipPosition="top"
                />
              </div>

              <div className={styles.sideNavContent}>
                <SideNavItems>
                  {defaultQuery && !searchTerm && (
                    <QueryItem
                      query={defaultQuery}
                      key={defaultQuery.createdAt}
                      disabled
                      isCollapsed={!isExpanded}
                    />
                  )}
                  <SortableContext
                    items={filteredSortableQueries.map((query) => query.createdAt)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredSortableQueries.map((query) => (
                      <QueryItem query={query} key={query.createdAt} isCollapsed={!isExpanded} />
                    ))}
                  </SortableContext>
                </SideNavItems>
              </div>
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeQuery ? <QueryItem query={activeQuery} isCollapsed={!isExpanded} /> : null}
        </DragOverlay>
      </DndContext>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.title}
          subtitle={notification.subtitle}
          onClose={() => setNotification(null)}
          hideCloseButton={false}
          className={styles.notification}
        />
      )}
    </div>
  );
}
