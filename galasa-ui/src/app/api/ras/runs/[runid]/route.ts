/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResultArchiveStoreAPIApi } from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';

export async function PUT(request: NextRequest, { params }: { params: { runid: string } }) {
  try {
    const { runid } = params;
    const body = await request.json();
    const { tagsToAdd = [], tagsToRemove = [], existingTags = [] } = body;

    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    // Create a set of tags to remove for efficient lookup, ensuring uniqueness.
    const tagsToRemoveSet = new Set(tagsToRemove.map((tag: string) => tag.toLowerCase()));

    // Filter out tags that should be removed.
    const filteredTags = existingTags.filter(
      (tag: string) => !tagsToRemoveSet.has(tag.toLowerCase())
    );

    // Add new tags, avoiding duplicates (case-insensitive).
    const existingTagsLower = new Set(filteredTags.map((tag: string) => tag.toLowerCase()));
    const uniqueNewTags = tagsToAdd.filter(
      (tag: string) => !existingTagsLower.has(tag.toLowerCase())
    );

    // Combine filtered existing tags with new unique tags.
    const updatedTags = [...filteredTags, ...uniqueNewTags];

    // Send PUT request to update the run with new tags.
    await rasApiClient.putRasRunTagsOrStatusById(runid, {
      tags: updatedTags,
    });

    return NextResponse.json({ success: true, tags: updatedTags });
  } catch (error: any) {
    console.error('Error updating run tags:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update tags' },
      { status: 500 }
    );
  }
}
