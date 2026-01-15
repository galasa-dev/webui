/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { DismissibleTag, Tag } from '@carbon/react';
import { useMemo } from 'react';
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
}: {
  tags: string[];
  isDismissible: boolean;
  size: TagSize;
  onTagRemove?: (tag: string) => void;
}) => {
  const translations = useTranslations('OverviewTab');

  const tagsWithColours = useMemo(
    () =>
      tags.map((tag) => {
        const [backgroundColour, foregroundColour] = textToHexColour(tag);
        return { tag, backgroundColour, foregroundColour };
      }),
    [tags]
  );

  if (tags.length === 0) {
    return <p>{translations('noTags')}</p>;
  }

  return (
    <div className={styles.tagsContainer}>
      {tagsWithColours.map((tagWithColour: TagWithColour, index) => {
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
      })}
    </div>
  );
};

export default RenderTags;
