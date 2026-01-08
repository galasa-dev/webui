/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { DismissibleTag, Tag } from "@carbon/react";
import { useMemo } from "react";
import { useTranslations } from 'next-intl';
import { textToHexColour } from "@/utils/functions/textToHexColour";

type TagWithColour = {
  tag: string;
  backgroundColour: string;
  foregroundColour: string;
};

const RenderTags = ({ tags, dismissible }: { tags: string[], dismissible: boolean }) => {
  const translations = useTranslations('OverviewTab');

  const tagsWithColours = useMemo(() =>
    tags.map(tag => {
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
          color: tagWithColour.foregroundColour
        };

        return dismissible ? (
          <DismissibleTag
            key={index}
            dismissTooltipAlignment="bottom"
            onClose={() => {}}
            size="md"
            text={tagWithColour.tag}
            title={translations('removeTag')}
            style={style}
          />
        ) : (
          <Tag size="md" key={index} style={style}>
            {tagWithColour.tag}
          </Tag>
        );
      })}
    </>
  );
}

export default RenderTags;




/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// import { DismissibleTag, Tag } from "@carbon/react";
// import { useEffect, useState } from "react";
// import { useTranslations } from 'next-intl';
// import { textToHexColour } from "@/utils/functions/textToHexColour";

// type TagWithColour = {
//   tag: string;
//   backgroundColour: string;
//   foregroundColour: string;
// };

// const RenderTags = ({ tags, dismissible }: { tags: string[], dismissible: Boolean }) => {

//   const [tagsWithColours, setTagsWithColours] = useState<TagWithColour[]>([]);
//   const translations = useTranslations('OverviewTab');

//   useEffect(() => {
//     const tempTagsWithColours: TagWithColour[] = [];
//     if (tagsWithColours.length === 0 && tags.length > 0) {
//       tags.map((tag) => {
//         const backgroundandForegroundHexColour: [string, string] = textToHexColour(tag);
//         tempTagsWithColours.push({
//           tag: tag,
//           backgroundColour: backgroundandForegroundHexColour[0],
//           foregroundColour: backgroundandForegroundHexColour[1]
//         });
//       });
//     }
//     setTagsWithColours(tempTagsWithColours);
//   }, [tags]);

//   // 1) no tags
//   // 2) dismissible + tags without tagsWithColours

//   let renderedTags: JSX.Element = <></>;
  
//   if (tags.length === 0) {
//     if (dismissible && tagsWithColours.length > 0) {
//       renderedTags = <>
//         {tagsWithColours?.map((tagWithColour: TagWithColour, index) => {
//           return (
//             <DismissibleTag
//               key={index}
//               dismissTooltipAlignment="bottom"
//               onClose={()=> {}}
//               size="md"
//               text={tagWithColour.tag}
//               title={translations('removeTag')}
//               style={{backgroundColor: tagWithColour.backgroundColour, color: tagWithColour.foregroundColour}}
//             />
//           )
//         })}
//       </>;
//     } else if (dismissible && tagsWithColours.length === 0) {
//       renderedTags = <>
//         {tags?.map((tag: string, index) => {
//           return (
//             <DismissibleTag
//               key={index}
//               dismissTooltipAlignment="bottom"
//               onClose={()=> {}}
//               size="md"
//               text={tag}
//               title={translations('removeTag')}
//             />
//           )
//         })}
//       </>;
//     } else if (!dismissible && tagsWithColours.length > 0) {
//       renderedTags = <>
//         {tagsWithColours?.map((tagWithColour: TagWithColour, index) => (
//           <Tag size="md" key={index} style={{backgroundColor: tagWithColour.backgroundColour, color: tagWithColour.foregroundColour}}>
//             {tagWithColour.tag}
//           </Tag>
//         ))}
//       </>
//     } else {  // Not dismissible and no tagsWithColours.
//       renderedTags = <>
//         {tags?.map((tag: string, index) => (
//           <Tag size="md" key={index}>{tag}</Tag>
//         ))}
//       </>
//     }
//   } else {
//     renderedTags = <p>{translations('noTags')}</p>
//   }

//   return (
//     renderedTags
//   );
// }

// export default RenderTags;






// /*
//  * Copyright contributors to the Galasa project
//  *
//  * SPDX-License-Identifier: EPL-2.0
//  */

// import { DismissibleTag, Tag } from "@carbon/react";
// import { useEffect, useState } from "react";
// import { useTranslations } from 'next-intl';
// import { textToHexColour } from "@/utils/functions/textToHexColour";

// type tagWithColour = {
//   tag: string;
//   backgroundColour: string;
//   foregroundColour: string;
// };

// const RenderTags = ({ tags, dismissible }: { tags: string[], dismissible: Boolean }) => {

//   const [tagsWithColours, setTagsWithColours] = useState<tagWithColour[]>([]);
//   const translations = useTranslations('OverviewTab');

//   useEffect(() => {
//     const tempTagsWithColours: tagWithColour[] = [];
//     if (tagsWithColours.length === 0 && tags.length > 0) {
//       tags.map((tag) => {
//         const backgroundandForegroundHexColour: [string, string] = textToHexColour(tag);
//         tempTagsWithColours.push({
//           tag: tag,
//           backgroundColour: backgroundandForegroundHexColour[0],
//           foregroundColour: backgroundandForegroundHexColour[1]
//         });
//       });
//     }
//     setTagsWithColours(tempTagsWithColours);
//   }, [tags]);

//   // 1) no tags
//   // 2) dismissible + tags without tagsWithColours
  
//   return (
//     <>
//       {tags?.length > 0 ? (
//         // There are tags, but tagsWithColours may be empty
//         tagsWithColours?.length > 0 ? (
//           tagsWithColours?.map((tagWithColour: tagWithColour, index) => {
//             return (
//               <DismissibleTag
//                 key={index}
//                 dismissTooltipAlignment="bottom"
//                 onClose={()=> {}}
//                 size="md"
//                 text={tagWithColour.tag}
//                 title={translations('removeTag')}
//                 style={{backgroundColor: tagWithColour.backgroundColour, color: tagWithColour.foregroundColour}}
//               />
//             )
//           })
//         ) : (
//           tags?.map((tag, index) => (
//             <Tag size="md" key={index}>
//               {tag}
//             </Tag>
//           )
//         ))
//       ) : (
//         <p>{translations('noTags')}</p>
//       )}
//     </>
//   )
// }

// export default RenderTags;