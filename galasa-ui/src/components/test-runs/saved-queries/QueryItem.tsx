/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { SavedQueryType } from '@/utils/types/common';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarFilled, Draggable, ChevronDown } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/QueryItem.module.css';
import { Link, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

interface QueryItemProps {
  query: SavedQueryType;
  disabled?: boolean;
  isCollapsed?: boolean;
  handleDeleteQuery?: (id: string) => void;
  handleCopyQuery?: (id: string) => void;
  handleRenameQuery?: (id: string) => void;
  handleSetQueryAsDefault?: (id: string) => void;
}

export default function QueryItem({
  query,
  disabled = false,
  isCollapsed = false,
  handleDeleteQuery,
  handleCopyQuery,
  handleRenameQuery,
  handleSetQueryAsDefault,
}: QueryItemProps) {
  const translations = useTranslations('QueryItem');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
    disabled,
  });

  const { defaultQuery } = useSavedQueries();

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0 : 1,
    }),
    [transform, transition, isDragging]
  );

  const isDefault = defaultQuery.createdAt === query.createdAt;

  // Actions for the query item
  const actions = [
    { title: translations('rename'), onClick: () => handleRenameQuery?.(query.createdAt) },
    {
      title: translations('delete'),
      onClick: () => handleDeleteQuery?.(query.createdAt),
      isDelete: true,
    },
    { title: translations('copyToClipboard'), onClick: () => handleCopyQuery?.(query.createdAt) },
    {
      title: translations('setAsDefault'),
      onClick: () => handleSetQueryAsDefault?.(query.createdAt),
      disabled: isDefault,
    },
  ];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sideNavItem} ${disabled ? styles.disabled : ''} ${isCollapsed ? styles.collapsed : ''}`}
    >
      {isDefault ? (
        <StarFilled size={18} className={styles.starIcon} />
      ) : (
        <Draggable
          aria-label={translations('dragHandle')}
          size={18}
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        />
      )}

      <Link href={`?q=${query.url}`} className={styles.sideNavLink}>
        {query.title}
      </Link>

      <div className={styles.cellDropdown}>
        <OverflowMenu aria-label={translations('dropdownLabel')} renderIcon={ChevronDown} flipped>
          {actions.map((action, index) => (
            <OverflowMenuItem
              key={`${query.createdAt}-${action.title}`}
              itemText={action.title}
              onClick={action.onClick}
              isDelete={action.isDelete}
              disabled={action.disabled}
            />
          ))}
        </OverflowMenu>
      </div>
    </div>
  );
}
