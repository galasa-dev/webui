/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ArtifactIndexEntry } from '@/generated/galasaapi';
import { FolderNode } from '@/utils/functions/artifacts';
import { cleanArtifactPath } from '@/utils/artifacts';

/**
 * Builds a tree structure from a list of artifacts.
 * This function processes artifact paths and creates a hierarchical folder/file structure.
 *
 * @param artifacts - Array of artifact entries to process
 * @returns A FolderNode representing the root of the tree structure
 */
export function buildArtifactsTree(artifacts: ArtifactIndexEntry[]): FolderNode {
  const root: FolderNode = { name: '', isFile: false, children: {} };

  artifacts.forEach((artifact) => {
    const rawPath = artifact.path ?? '';
    const cleanedPath = cleanArtifactPath(rawPath);
    let segments = cleanedPath.split('/').filter((seg) => seg !== '');

    // Remove "artifact" or "artifacts" prefix from paths
    const segmentValue = segments[0]?.toLocaleLowerCase();
    if (segmentValue === 'artifact' || segmentValue === 'artifacts') {
      segments = segments.slice(1);
    }

    if (segments.length > 0) {
      let currentNode: FolderNode = root;
      segments.forEach((segment, idx) => {
        const isLast = idx === segments.length - 1;

        if (isLast) {
          // It's a file: insert a FileNode under currentNode.children
          currentNode.children[segment] = {
            name: segment,
            runId: artifact.runId ?? '',
            url: artifact.path ?? '',
            isFile: true,
            children: {},
          };
        } else {
          // It's a folder: create or reuse a FolderNode
          const existing = currentNode.children[segment];

          if (!existing) {
            // Create new folder if it doesn't exist
            currentNode.children[segment] = {
              name: segment,
              isFile: false,
              children: {},
            };
            currentNode = currentNode.children[segment] as FolderNode;
          } else if (existing.isFile) {
            // Conflict: a file was created here before. Replace it with a folder.
            currentNode.children[segment] = {
              name: segment,
              isFile: false,
              children: {},
            };
            currentNode = currentNode.children[segment] as FolderNode;
          } else {
            // Descend into existing folder
            currentNode = existing as FolderNode;
          }
        }
      });
    }
  });

  return root;
}

// Made with Bob
