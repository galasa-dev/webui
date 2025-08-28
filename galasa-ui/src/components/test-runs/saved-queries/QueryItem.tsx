/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { NotificationType, SavedQueryType } from '@/utils/types/common';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarFilled, Draggable, ChevronDown } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/QueryItem.module.css';
import { OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Dispatch, SetStateAction } from 'react';

interface QueryItemProps {
  query: SavedQueryType;
  disabled?: boolean;
  isCollapsed?: boolean;
  handleEditQueryName?: (queryName: string) => void;
  setNotification: Dispatch<SetStateAction<NotificationType | null>>;
}

const ICON_SIZE = 18;

export default function QueryItem({
  query,
  disabled = false,
  isCollapsed = false,
  handleEditQueryName,
  setNotification,
}: QueryItemProps) {
  const translations = useTranslations('QueryItem');
  const router = useRouter();
  const pathname = usePathname();
  const { defaultQuery, setDefaultQuery, getQueryByName, deleteQuery } = useSavedQueries();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.createdAt,
    disabled,
  });

  const isDefault = defaultQuery.createdAt === query.createdAt;

  // Actions for the query item
  const actions = [
    { title: translations('rename'), onClick: () => handleRenameQuery(query.title) },
    { title: translations('copyToClipboard'), onClick: () => handleShareQuery(query.title) },
    {
      title: translations('setAsDefault'),
      onClick: () => handleSetQueryAsDefault(query.title),
      disabled: isDefault,
    },
    {
      title: translations('delete'),
      onClick: () => handleDeleteQuery?.(query.title),
      isDelete: true,
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

  const handleRenameQuery = (queryName: string) => {
    const queryToRename = getQueryByName(queryName);

    if (queryToRename) {
      // Navigate to the query URL
      const newUrl = `${pathname}?q=${queryToRename.url}`;
      router.replace(newUrl, { scroll: false });

      // Handle renaming query
      handleEditQueryName?.(queryToRename.title);
    }
  };

  const handleShareQuery = async (queryName: string) => {
    const queryToShare = getQueryByName(queryName);

    if (queryToShare) {
      try {
        await navigator.clipboard.writeText(
          `${window.location.origin}/${pathname}?q=${queryToShare.url}`
        );

        setNotification({
          kind: 'success',
          title: translations('copiedTitle', { name: queryToShare.title }),
          subtitle: translations('copiedMessage'),
        });
        setTimeout(() => setNotification(null), 6000);
      } catch (err) {
        setNotification({
          kind: 'error',
          title: translations('errorTitle'),
          subtitle: translations('copyFailedMessage'),
        });
      }
    }
  };

  const handleSetQueryAsDefault = (queryName: string) => {
    const queryToSetAsDefault = getQueryByName(queryName);

    if (queryToSetAsDefault) {
      setDefaultQuery(queryToSetAsDefault.createdAt);

      setNotification({
        kind: 'success',
        title: translations('setAsDefaultTitle', { name: queryToSetAsDefault.title }),
        subtitle: translations('setAsDefaultMessage'),
      });
      setTimeout(() => setNotification(null), 6000);
    }
  };

  const handleDeleteQuery = (queryName: string) => {
    const queryToDelete = getQueryByName(queryName);

    if (queryToDelete) {
      deleteQuery(queryToDelete.createdAt);

      setNotification({
        kind: 'success',
        title: translations('deleteTitle', { name: queryToDelete.title }),
        subtitle: translations('deleteMessage'),
      });
      setTimeout(() => setNotification(null), 6000);
    }
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
