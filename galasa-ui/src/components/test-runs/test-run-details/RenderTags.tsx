/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { DismissibleTag, Tag } from '@carbon/react';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { textToHexColour } from '@/utils/functions/textToHexColour';

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
}: {
  tags: string[];
  dismissible: boolean;
  size: TagSize;
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
    <>
      {tagsWithColours.map((tagWithColour: TagWithColour, index) => {
        const style = {
          backgroundColor: tagWithColour.backgroundColour,
          color: tagWithColour.foregroundColour,
        };

        return dismissible ? (
          <DismissibleTag
            key={index}
            dismissTooltipAlignment="bottom"
            onClose={() => {}}
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
    </>
  );
};

export default RenderTags;
