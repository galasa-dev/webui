/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { SavedQueryType } from '@/utils/types/common';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarFilled, Draggable } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/QueryItem.module.css';
import { Link } from '@carbon/react';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';

interface QueryItemProps {
  query: SavedQueryType;
  disabled?: boolean;
  isCollapsed?: boolean;
}

export default function QueryItem({
  query,
  disabled = false,
  isCollapsed = false,
}: QueryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const { defaultQuery } = useSavedQueries();
  const isDefault = defaultQuery.createdAt === query.createdAt;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sideNavItem} ${disabled ? styles.disabled : ''} ${isCollapsed ? styles.collapsed : ''}`}
    >
      {isDefault ? (
        <StarFilled size={18} className={styles.starIcon} />
      ) : (
        <Draggable size={18} className={styles.dragHandle} {...attributes} {...listeners} />
      )}
      <Link href={`?q=${query.url}`} className={styles.sideNavLink}>
        {query.title}
      </Link>
    </div>
  );
}
