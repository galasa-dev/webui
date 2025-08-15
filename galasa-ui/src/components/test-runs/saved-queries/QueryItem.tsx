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

export default function QueryItem({ query }: { query: SavedQueryType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sideNavItem} ${isDragging ? styles.dragging : ''}`}
    >
      <Draggable size={18} className={styles.dragHandle} {...attributes} {...listeners} />

      <Link href={`?${query.url}`} className={styles.sideNavLink}>
        {query.title}
      </Link>
    </div>
  );
}
