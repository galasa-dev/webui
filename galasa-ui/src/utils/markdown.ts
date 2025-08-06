/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import fs from 'fs';
import path from 'path';

export function getMarkdownFilePath(locale: string): string {
  const localizedFileName = `home-contents.${locale}.md`;
  const fallbackFileName = `home-contents.md`;
  const markdownDir = path.join(process.cwd(), 'public', 'static', 'markdown');
  const localizedFilePath = path.join(markdownDir, localizedFileName);
  const fallbackFilePath = path.join(markdownDir, fallbackFileName);
  return fs.existsSync(localizedFilePath) ? localizedFilePath : fallbackFilePath;
}
