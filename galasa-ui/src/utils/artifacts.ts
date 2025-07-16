/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export const handleDownload = (content: string | ArrayBuffer | Blob, fileName: string) => {
  const blob = content instanceof Blob ? content : new Blob([content]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const cleanArtifactPath = (rawPath: string) => {
  let cleanedPath = rawPath;
  if (rawPath.startsWith("./")) {
    cleanedPath = rawPath.substring(2);
  } else if (rawPath.startsWith("/")) {
    cleanedPath = rawPath.substring(1);
  }

  return cleanedPath;
};
