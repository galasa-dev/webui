/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { fetchTestArtifacts } from '@/utils/testRuns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const artifacts = await fetchTestArtifacts(runId);
    return NextResponse.json(artifacts);
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    return NextResponse.json({ error: 'Failed to fetch artifacts' }, { status: 500 });
  }
}
