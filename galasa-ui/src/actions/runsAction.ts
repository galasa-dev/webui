/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use server';

import { ResultArchiveStoreAPIApi, TagsAPIApi } from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';
import { fetchRunDetailLogs } from '@/utils/testRuns';
import { CLIENT_API_VERSION } from '@/utils/constants/common';

export const downloadArtifactFromServer = async (runId: string, artifactUrl: string) => {
  const apiConfig = createAuthenticatedApiConfiguration();
  const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

  const artifactFile = await rasApiClient.getRasRunArtifactByPath(
    runId,
    artifactUrl,
    CLIENT_API_VERSION
  );
  const contentType = artifactFile.type;

  const arrayBuffer = await artifactFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const size = artifactFile.size;

  const base64 = buffer.toString('base64');

  let data: string;

  if (contentType.includes('application/json')) {
    // buffer.toString('utf-8') converts the raw bytes into a JSON string
    const utf8String = buffer.toString('utf-8');
    try {
      data = JSON.parse(utf8String);
    } catch (e) {
      // If parsing fails, just return the raw string under data
      data = utf8String;
    }
  } else {
    // Otherwise, treat it as plain text (or any other mime) and return the UTF-8 string
    data = buffer.toString('utf-8');
  }

  return {
    contentType,
    data,
    size,
    base64,
  };
};

export const updateRunTags = async (runId: string, tags: string[]) => {
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    // Note: Tags are already unique from the Set in the frontend, but is checked again by the rest api.
    await rasApiClient.putRasRunTagsOrStatusById(runId, {
      tags: tags,
    });

    return { success: true, tags: tags };
  } catch (error: any) {
    console.error('Error updating run tags:', error);
    return {
      success: false,
      error: error.message || 'Failed to update tags',
    };
  }
};

export const getExistingTagObjects = async () => {
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const tagsApiClient = new TagsAPIApi(apiConfig);

    const tagsResponse = await tagsApiClient.getTags();

    // Convert to plain objects and extract tag names.
    const tagNames = tagsResponse
      .map((tag) => tag.metadata?.name)
      .filter((name): name is string => name !== undefined && name !== null);

    return { success: true, tags: tagNames };
  } catch (error: any) {
    console.error('Error getting existing tags:', error);
    return {
      success: false,
      error: error.message || 'Failed to get existing tags',
      tags: [],
    };
  }
};

export const fetchRunLog = async (runId: string) => {
  try {
    const runLog = await fetchRunDetailLogs(runId);
    return runLog;
  } catch (error: any) {
    throw new Error(error);
  }
};
