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
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

interface QueryItemProps {
  query: SavedQueryType;
  disabled?: boolean;
  isCollapsed?: boolean;
  handleDeleteQuery?: (id: string) => void;
  handleCopyQuery?: (id: string) => void;
  handleRenameQuery?: (id: string) => void;
  handleSetQueryAsDefault?: (id: string) => void;
}

const ICON_SIZE = 18;

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
  const router = useRouter();
  const pathname = usePathname();
  const { defaultQuery } = useSavedQueries();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
    disabled,
  });

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

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
        <Draggable
          aria-label={translations('dragHandle')}
          size={ICON_SIZE}
          className={styles.dragHandle}
          {...attributes}
          {...listeners}
        />
      )}

      <div onClick={handleClick} className={styles.sideNavLink} role="button">
        {query.title}
      </div>

      <OverflowMenu
        aria-label={translations('actions')}
        iconDescription={translations('actions')}
        className={styles.overflowMenu}
        renderIcon={ChevronDown}
        flipped
      >
        {actions.map((action) => (
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
  );
}
