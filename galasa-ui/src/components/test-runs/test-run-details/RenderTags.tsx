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
  dismissible,
  size,
  onTagRemove,
  disabledTags = [],
}: {
  tags: string[];
  dismissible: boolean;
  size: TagSize;
  onTagRemove?: (tag: string) => void;
  disabledTags?: string[];
}) => {
  const translations = useTranslations('OverviewTab');

  const tagsWithColours = useMemo(
    () =>
      tags.map((tag) => {
        const [backgroundColour, foregroundColour] = textToHexColour(tag);
        const isDisabled = disabledTags.includes(tag);
        return { tag, backgroundColour, foregroundColour, isDisabled };
      }),
    [tags, disabledTags]
  );

  if (tags.length === 0) {
    return <p>{translations('noTags')}</p>;
  }

  return (
    <>
      {tagsWithColours.map((tagWithColour: TagWithColour & { isDisabled: boolean }, index) => {
        // Inline styles needed to grab colours from the "tagWithColour" variable.
        const style = {
          backgroundColor: `${tagWithColour.backgroundColour}`,
          color: `${tagWithColour.foregroundColour}`,
          opacity: tagWithColour.isDisabled ? 0.5 : 1,
        };

        return dismissible ? (
          <DismissibleTag
            key={index}
            className={styles.dismissibleTag}
            dismissTooltipAlignment="bottom"
            onClose={() => {
              if (onTagRemove && !tagWithColour.isDisabled) {
                onTagRemove(tagWithColour.tag);
              }
            }}
            size={size}
            text={tagWithColour.tag}
            title={translations('removeTag')}
            style={style}
            disabled={tagWithColour.isDisabled}
          />
        ) : (
          <Tag size={size} key={index} style={style}>
            {tagWithColour.tag}
          </Tag>
        );
      })}
    </>
  );
};

export default RenderTags;
