/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import { Section } from "@carbon/react";
import styles from "../styles/HomeContent.module.css";
import { useEffect, useState } from "react";
import MarkdownIt from 'markdown-it';

export default function HomeContent() {

  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [cpsMarkdownContent, setCpsMarkdownContent] = useState<string>("");

  useEffect(() => {
    let md = new MarkdownIt({
      html: false
    });

    //fetching CPS properties from API
    //Overrides the default markdown content present in /public/static/markdown/home-contents.md
    const fetchHomeTitleFromCps = async () => {

      try {
        const response = await fetch("/home", { method: "GET" });

        if (response.ok) {

          let markdownFileContent = await response.text();

          let result = md.render(markdownFileContent);

          setCpsMarkdownContent(result);
        }
      } catch (err) {
        console.error('Error fetching or processing the markdown file', err);
      }
    };

    //fetching markdown content from local project files
    //will be used as default if no CPS property is set
    const fetchMarkdown = async () => {
      try {
        // Fetch the markdown file from the public/static folder
        const response = await fetch('/static/markdown/home-contents.md');
        const text = await response.text();

        // Convert the markdown to HTML
        const processedContent = md.render(text);
        setMarkdownContent(processedContent.toString());
      } catch (error) {
        console.error('Error fetching or processing the markdown file', error);
      }
    };
    Promise.all([fetchHomeTitleFromCps(), fetchMarkdown()]);
  }, []);

  return (
    <Section level={1}>
      <div className={styles.homeContentWrapper}>
                
        {   
          cpsMarkdownContent ? <div dangerouslySetInnerHTML={{ __html: cpsMarkdownContent }} />
            :
            <div dangerouslySetInnerHTML={{ __html: markdownContent }} />
        }

      </div>

    </Section>
  );

}