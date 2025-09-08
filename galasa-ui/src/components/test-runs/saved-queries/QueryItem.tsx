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
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { usePathname, useRouter } from 'next/navigation';

interface QueryItemProps {
  query: SavedQueryType;
  disabled?: boolean;
  isCollapsed?: boolean;
}

const ICON_SIZE = 18;

export default function QueryItem({
  query,
  disabled = false,
  isCollapsed = false,
}: QueryItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { defaultQuery } = useSavedQueries();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  const isDefault = defaultQuery.createdAt === query.createdAt;

  const handleClick = () => {
    const newUrl = `${pathname}?q=${query.url}`;

    // Navigate to the correct URL.
    router.replace(newUrl, { scroll: false });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sideNavItem} ${disabled ? styles.disabled : ''} ${isCollapsed ? styles.collapsed : ''}`}
    >
      {isDefault ? (
        <StarFilled size={ICON_SIZE} className={styles.starIcon} />
      ) : (
        <Draggable size={ICON_SIZE} className={styles.dragHandle} {...attributes} {...listeners} />
      )}
      <div onClick={handleClick} className={styles.sideNavLink} role="button">
        {query.title}
      </div>
    </div>
  );
}
