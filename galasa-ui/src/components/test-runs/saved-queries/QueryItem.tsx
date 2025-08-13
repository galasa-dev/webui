/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { savedQueryType } from '@/utils/types/common';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { StarFilled, Draggable } from '@carbon/icons-react';
import styles from '@/styles/test-runs/saved-queries/QueryItem.module.css';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';

export default function QueryItem({ query }: { query: savedQueryType }) {
  const router = useRouter();
  const pathname = usePathname();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: query.url,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    try {
      const savedUrl = new URL(query.url);
      const newQueryParam = savedUrl.searchParams.get('q');

      if (newQueryParam) {
        // Construct the new URL and navigate
        router.push(`${pathname}?q=${newQueryParam}`);
      }
    } catch (error) {
      console.error('Invalid URL in saved query:', query.url);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${styles.sideNavItem} ${isDragging ? styles.dragging : ''}`}
    >
      <Draggable size={18} className={styles.dragHandle} {...attributes} {...listeners} />

      <Link href={query.url} className={styles.sideNavLink}>
        {query.title}
      </Link>
    </div>
  );
}
