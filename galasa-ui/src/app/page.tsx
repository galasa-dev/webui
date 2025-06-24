/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import HomeContent from "@/components/HomeContent";
import PageTile from "@/components/PageTile";
import { ConfigurationPropertyStoreAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { MarkdownResponse } from "@/utils/interfaces";
import { readFile } from "fs/promises";
import { getLocale } from "next-intl/server";
import { getMarkdownFilePath } from "@/utils/markdown";
import path from "path";

export default function HomePage() {
  // Fetches the content contained in the service.welcome.markdown CPS property from the API server
  // Overrides the default markdown content present in /public/static/markdown/home-contents.md
  const fetchHomePageContentFromCps = async (): Promise<MarkdownResponse> => {
    const NAMESPACE = "service";
    const PROPERTY_NAME = "welcome.markdown";

    let content: MarkdownResponse = {
      markdownContent: "",
      responseStatusCode: 200
    };

    try {
      const cpsApiClientWithAuthHeader = new ConfigurationPropertyStoreAPIApi(createAuthenticatedApiConfiguration());
      const response = await cpsApiClientWithAuthHeader.getCpsProperty(NAMESPACE, PROPERTY_NAME);

      if (response.length > 0) {
        const property = response[0];
        if (property.data && property.data.value) {
          content = {
            markdownContent: property.data.value,
            responseStatusCode: 200,
          };
        }
      }
    } catch (error: any) {
      console.warn('Failed to fetch custom markdown content from CPS', error);

      if (error.code === 403) {
        return {
          markdownContent: "Access Forbidden",
          responseStatusCode: 403
        };
      }

      throw error;
    }
    return content;
  };

  const fetchDefaultMarkdownContent = async (locale: string): Promise<MarkdownResponse> => {
    let content: MarkdownResponse = {
      markdownContent: "",
      responseStatusCode: 200
    };
    try {
      // Fetch the markdown file from the public/static folder
      const defaultContentFilePath = path.join(process.cwd(), "public", "static", "markdown", "home-contents.md");
      content = {
        markdownContent: await readFile(getMarkdownFilePath(locale), 'utf-8'),
        responseStatusCode: 200
      };

    } catch (error) {
      console.error('Error fetching or processing the default markdown contents', error);
      throw error;
    }
    return content;
  };

  // Fetch the content from the CPS property first, otherwise fall back to the default markdown content if unsuccessful
  let markdownContentPromise: Promise<MarkdownResponse>;

  markdownContentPromise = fetchHomePageContentFromCps().catch(() =>fetchDefaultMarkdownContent( locale ));

  return (
    <main id="content">
      <PageTile data-testid="page-tile" translationKey={"Home.title"} />
      <HomeContent markdownContentPromise={markdownContentPromise} />
    </main>
  );
}
