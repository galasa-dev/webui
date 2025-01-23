/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import HomeContent from "@/components/HomeContent";
import PageTile from "@/components/PageTile";
import { ConfigurationPropertyStoreAPIApi } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import { readFile } from "fs/promises";
import path from "path";

export default function HomePage() {

  // Fetches the content contained in the service.welcome.markdown CPS property from the API server
  // Overrides the default markdown content present in /public/static/markdown/home-contents.md
  const fetchHomePageContentFromCps = async () => {
    const NAMESPACE = "service";
    const PROPERTY_NAME = "welcome.markdown";

    let content = "";
    try {
      const cpsApiClientWithAuthHeader = new ConfigurationPropertyStoreAPIApi(createAuthenticatedApiConfiguration());
      const response = await cpsApiClientWithAuthHeader.getCpsProperty(NAMESPACE, PROPERTY_NAME);
  
      if (response.length > 0) {
        const property = response[0];
        if (property.data && property.data.value) {
          content = property.data.value;
        }
      }
    } catch (error) {
      console.warn('Failed to fetch custom markdown content from CPS', error);
      throw error;
    }
    return content;
  };

  // Fetches markdown content from local project files, which will be used as the
  // default content if the service.welcome.markdown property is not set
  const fetchDefaultMarkdownContent = async () => {
    let content = "";
    try {
      // Fetch the markdown file from the public/static folder
      const defaultContentFilePath = path.join(process.cwd(), "public", "static", "markdown", "home-contents.md");
      content = await readFile(defaultContentFilePath, 'utf-8');

    } catch (error) {
      console.error('Error fetching or processing the default markdown contents', error);
      throw error;
    }
    return content;
  };

  // Fetch the content from the CPS property first, otherwise fall back to the default markdown content if unsuccessful
  const markdownContentPromise = fetchHomePageContentFromCps()
    .catch(() => fetchDefaultMarkdownContent());

  return (
    <main id="content">
      <PageTile data-testid="page-tile" title={"Home"} />
      <HomeContent markdownContentPromise={markdownContentPromise} />
    </main>
  );
};
