/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { fetchRunDetailLogs } from '@/utils/testRuns';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const log = await fetchRunDetailLogs(runId);
    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error fetching run log:', error);
    return NextResponse.json({ error: 'Failed to fetch run log' }, { status: 500 });
  }
}
