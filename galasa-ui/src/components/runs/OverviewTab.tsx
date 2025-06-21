/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from "react";
import styles from "@/styles/OverviewTab.module.css";
import InlineText from "./InlineText";
import { Tag } from "@carbon/react";
import { RunMetadata } from "@/utils/interfaces";
import { useTranslations } from "next-intl";

const OverviewTab = ({ metadata }: { metadata: RunMetadata }) => {
  const tags = metadata?.tags || [];
  const translations = useTranslations("OverviewTab");

  return (
    <>
      <InlineText
        title={`${translations("bundle")}:`}
        value={metadata?.bundle} />
      <InlineText
        title={`${translations("test")}:`}
        value={metadata?.testName}
      />
      <InlineText title={`${translations("group")}:`} value={metadata?.group} />
      <InlineText
        title={`${translations("submissionId")}:`}
        value={metadata?.submissionId}
      />
      <InlineText
        title={`${translations("requestor")}:`}
        value={metadata?.requestor}
      />

      <div className={styles.infoContainer}>
        <InlineText
          title={`${translations("submitted")}:`}
          value={metadata?.submitted}
        />
        <InlineText
          title={`${translations("started")}:`}
          value={metadata?.startedAt}
        />
        <InlineText
          title={`${translations("finished")}:`}
          value={metadata?.finishedAt}
        />
        <InlineText
          title={`${translations("duration")}:`}
          value={metadata?.duration}
        />
      </div>

      <div className={styles.tagsSection}>
        <h5>{translations("tags")}</h5>
        <div className={styles.tagsContainer}>
          {tags?.length > 0 ? (
            tags?.map((tag, index) => (
              <Tag size="md" key={index}>
                {tag}
              </Tag>
            ))
          ) : (
            <p>{translations("noTags")}</p>
          )}
        </div>
      </div>
    </>
  );
};

export default OverviewTab;
