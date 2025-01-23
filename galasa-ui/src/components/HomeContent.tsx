/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { Section } from "@carbon/react";
import styles from "@/styles/HomeContent.module.css";
import { useEffect, useState } from "react";
import MarkdownIt from 'markdown-it';

interface HomeContentProps {
  markdownContentPromise: Promise<string>;
}

export default function HomeContent({markdownContentPromise}: HomeContentProps) {

  const [renderedHtmlContent, setRenderedHtmlContent] = useState<string>("");

  useEffect(() => {
    let md = new MarkdownIt({
      html: false
    });

    const setRenderedHtmlFromMarkdown = async () => {
      try {
        const markdownContent = await markdownContentPromise;
        setRenderedHtmlContent(md.render(markdownContent));
      } catch (err) {
        console.error('Error fetching or processing markdown content', err);
      }
    };

    setRenderedHtmlFromMarkdown();
  }, [markdownContentPromise]);

  return (
    <Section level={1}>
      <div className={styles.homeContentWrapper}>
        <div dangerouslySetInnerHTML={{ __html: renderedHtmlContent }} />
      </div>
    </Section>
  );

}