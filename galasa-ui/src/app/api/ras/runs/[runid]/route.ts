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
    const { tags = [] } = body;

    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);

    // Note: Tags are already unique from the Set in the frontend.
    await rasApiClient.putRasRunTagsOrStatusById(runid, {
      tags: tags,
    });

    return NextResponse.json({ success: true, tags: tags });
  } catch (error: any) {
    console.error('Error updating run tags:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update tags' },
      { status: 500 }
    );
  }
}
