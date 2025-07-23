/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { downloadArtifactFromServer } from "@/actions/runsAction";
import { ArtifactIndexEntry } from "@/generated/galasaapi";
import { cleanArtifactPath } from "@/utils/artifacts";
import { fetchRunDetailLogs, fetchTestArtifacts } from "@/utils/testRuns";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";

/**
 * Populates a JSZip instance with the run log and artifacts.
 * 
 * @param zip The JSZip instance to populate.
 * @param runId The ID of the test run, needed for downloading artifacts.
 * @param logs The string content of the run log.
 * @param artifacts An array of artifact entries to download and add to the zip.
 */
async function populateZip(zip: JSZip, runId: string, logs: string, artifacts: ArtifactIndexEntry[]) : Promise<void> {
  // Add the run log to the zip
  zip.file("run.log", logs);

  // Fetch all artifacts in parallel
  const artifactPromises = artifacts.map(async (artifact) => {
    if (artifact.path) {
      // Download the artifact from the server
      const artifactDetails = await downloadArtifactFromServer(runId, artifact.path);

      // Clean the path and add it to the zip
      const cleanedPath = cleanArtifactPath(artifact.path);
      zip.file(cleanedPath, artifactDetails?.base64, { base64: true });
    }
  });

  await Promise.all(artifactPromises);
}

/**
 * Generates the final zip buffer and creates a downloadable HTTP Response.
 * 
 * @param zip The populated JSZip instance.
 * @param runName The name of the run, used for the filename.
 * @returns A Response object configured for file download.
 */
async function createZipResponse(zip: JSZip, runName: string | null): Promise<Response> {
  // Generate the zip file as a Node.js Buffer
  const content = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 } 
  });

  // Create the response with correct headers for file download
  const filename = `${runName || 'test-run'}.zip`;
  const headers = new Headers();
  headers.set('Content-Type', 'application/zip');
  headers.set('Content-Disposition', `attachment; filename="${filename}"`);
  headers.set('Content-Length', String(content.length));

  return new Response(content, {
    status: 200,
    headers: headers,
  });
}


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
    // 1. Fetch logs and artifacts in parallel
    const [logs, artifacts] = await Promise.all([
      fetchRunDetailLogs(runId),
      fetchTestArtifacts(runId)
    ]);

    // 2. Create and Populate the zip with logs and artifacts
    const zip = new JSZip();
    await populateZip(zip, runId, logs, artifacts);

    // 3. Generate the zip and create the final download response
    const response = await createZipResponse(zip, runName);
    return response;
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