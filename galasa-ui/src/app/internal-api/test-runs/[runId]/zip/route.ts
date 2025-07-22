/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { downloadArtifactFromServer } from "@/actions/runsAction";
import { cleanArtifactPath } from "@/utils/artifacts";
import { fetchRunDetailLogs, fetchTestArtifacts } from "@/utils/testRuns";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { runId: string } }
) {
  const { runId } = params;
  if (!runId) {
    return NextResponse.json({ error: "Run ID is required" }, { status: 400 });
  }

  // Get runName from the URL's query parameters
  const runName = request.nextUrl.searchParams.get('runName');

  try {
    // Fetch logs and artifacts in parallel
    const [logs, artifacts] = await Promise.all([
      fetchRunDetailLogs(runId),
      fetchTestArtifacts(runId)
    ]);

    const zip = new JSZip();

    // 1. Add the run log to the zip
    zip.file("run.log", logs);

    // 2. Fetch all artifacts in parallel
    const artifactPromises = artifacts.map(async (artifact) => {
      if (artifact.path) {
        // Download the artifact from the server
        const artifactDetails = await downloadArtifactFromServer(runId, artifact.path);

        // Clean the path and add it to the zip
        const cleanedPath = cleanArtifactPath(artifact.path);

        // JSZip can handle base64 encoded data
        zip.file(cleanedPath, artifactDetails?.base64, {base64: true});
      }
    });

    await Promise.all(artifactPromises);

    // 3. Generate the zip file as a Node.js Buffer
    const content = await zip.generateAsync({
      type: "nodebuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 } 
    });

    // 4. Create the response with correct headers for file download
    const filename = `${runName || 'test-run'}.zip`;
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Length', String(content.length));

    return new Response(content, {
      status: 200,
      headers: headers,
    });
  } catch (err) {
    console.error(`Failed to create zip for run ${runId}:`, err);
    return new Response(JSON.stringify({ error: 'Failed to generate the zip file on the server.' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } 
}