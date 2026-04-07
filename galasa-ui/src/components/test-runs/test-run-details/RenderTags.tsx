/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { DismissibleTag, Tag } from '@carbon/react';
import { useMemo, useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { textToHexColour } from '@/utils/functions/textToHexColour';
import styles from '@/styles/test-runs/test-run-details/RenderTags.module.css';

type TagWithColour = {
  tag: string;
  backgroundColour: string;
  foregroundColour: string;
};

type TagSize = 'sm' | 'md' | 'lg';

const RenderTags = ({
  tags,
  isDismissible,
  size,
  onTagRemove,
  truncate = false,
}: {
  tags: string[];
  isDismissible: boolean;
  size: TagSize;
  onTagRemove?: (tag: string) => void;
  truncate?: boolean;
}) => {
  const translations = useTranslations('OverviewTab');
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const tagsWithColours = useMemo(
    () =>
      tags.map((tag) => {
        const [backgroundColour, foregroundColour] = textToHexColour(tag);
        return { tag, backgroundColour, foregroundColour };
      }),
    [tags]
  );

  // Check if content is actually truncated
  useEffect(() => {
    if (truncate && containerRef.current) {
      const isOverflowing = containerRef.current.scrollHeight > containerRef.current.clientHeight;
      setIsTruncated(isOverflowing);
    }
  }, [truncate, tags]);

  if (tags.length === 0) {
    return <p>{translations('noTags')}</p>;
  }

  const renderTagElements = (includeEllipsis: boolean = false) => {
    const tagElements = tagsWithColours.map((tagWithColour: TagWithColour, index) => {
      // Inline styles needed to grab colours from the "tagWithColour" variable.
      const style = {
        backgroundColor: `${tagWithColour.backgroundColour}`,
        color: `${tagWithColour.foregroundColour}`,
      };

      return isDismissible ? (
        <DismissibleTag
          key={index}
          className={styles.dismissibleTag}
          dismissTooltipAlignment="bottom"
          onClose={() => {
            if (onTagRemove) {
              onTagRemove(tagWithColour.tag);
            }
          }}
          size={size}
          text={tagWithColour.tag}
          title={translations('removeTag')}
          style={style}
        />
      ) : (
        <Tag size={size} key={index} style={style}>
          {tagWithColour.tag}
        </Tag>
      );
    });

    // Add ellipsis tag if truncated
    if (includeEllipsis && isTruncated) {
      tagElements.push(
        <Tag size={size} key="ellipsis" className={styles.ellipsisTag} title={tags.join(', ')}>
          ...
        </Tag>
      );
    }

    return tagElements;
  };

  if (truncate) {
    const allTagsText = tags.join(', ');

    return (
      <div className={styles.truncatedWrapper}>
        <div
          ref={containerRef}
          className={`${styles.tagsContainer} ${styles.truncated}`}
          title={allTagsText}
        >
          {renderTagElements(false)}
        </div>
        {isTruncated && (
          <div className={styles.ellipsisTagWrapper}>
            <Tag size={size} className={styles.ellipsisTag} title={allTagsText}>
              ...
            </Tag>
          </div>
        )}
      </div>
    );
  }

  return <div className={styles.tagsContainer}>{renderTagElements(false)}</div>;
};

export default RenderTags;
