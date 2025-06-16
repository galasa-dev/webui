"use client";
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ArtifactIndexEntry } from '@/generated/galasaapi';
import { TreeView, TreeNode, InlineLoading, InlineNotification } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import styles from '@/styles/Artifacts.module.css';
import { CloudDownload, Document, Folder, Zip } from '@carbon/icons-react';
import { downloadArtifactFromServer } from '@/actions/runsAction';
import { Tile } from '@carbon/react';

interface FileNode {
  name: string;
  runId: string;
  url: string;
  isFile: true;
  children: {};
}

interface FolderNode {
  name: string;
  isFile: false;
  children: { [key: string]: TreeNodeData };
}

interface ArtifactDetails {
  artifactFile: string;
  fileSize:      string;
  fileName:      string;
  base64Data:    string;
  contentType:   string;
}

type TreeNodeData = FileNode | FolderNode;

type DownloadResult = { contentType: string; data: string; size: number; base64: string; };


export function ArtifactsTab({ artifacts, runId, runName }: { artifacts: ArtifactIndexEntry[], runId: string, runName: string }) {

  const [treeData, setTreeData] = useState<FolderNode>({
    name: '',
    isFile: false,
    children: {},
  });

  const [artifactDetails, setArtifactDetails] = useState<ArtifactDetails>({
    artifactFile: "",
    fileSize:      "",
    fileName:      "",
    base64Data:    "",
    contentType:   "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function formatFileSize(bytes: number) {

    let fileSize = "";

    if (bytes < 10000) {
      fileSize = `${bytes} bytes`;
    } else {
      const mb = bytes / (1024 * 1024);
      fileSize = `${mb.toFixed(2)} MB`;
    }

    return fileSize;
  }

  const handleDownloadClick = () => {
    if (!artifactDetails.base64Data) return;

    // (a) Turn Base64 string → binary string
    const binaryString = atob(artifactDetails.base64Data);
    // (b) Convert binary string → Uint8Array
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // (c) Create a Blob from that Uint8Array with the correct MIME type
    const blob = new Blob([bytes]);

    // (d) Create a temporary URL and “click” a hidden <a> to download it
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    const cleanFileName = artifactDetails.fileName.startsWith('/') ? artifactDetails.fileName.slice(1) : artifactDetails.fileName; //strip any leading slashes
    a.download = cleanFileName; // name (e.g. “myfile.json” or “notes.txt”)
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // (e) Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(url);
  };


  const downloadArtifact = async (runId: string, artifactUrl: string) => {

    setLoading(true);
    setError(null);

    try {

      const result: DownloadResult = await downloadArtifactFromServer(runId, artifactUrl);

      setArtifactDetails({
        artifactFile: result.data,
        fileSize:     formatFileSize(result.size),
        fileName:     artifactUrl,
        base64Data:   result.base64,
        contentType:  result.contentType,
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }

  };

  function renderArtifactContent(artifactFile: string, contentType: string) {
    let result;

    // 1) Nothing selected
    if (!artifactFile) {
      result = <p>Select a file to display its content</p>;
    }
    // 2) Plain-text (or any text/* MIME)
    else if (contentType.startsWith("text/")) {
      result = <pre>{artifactFile}</pre>;
    }
    // 3) JSON (or JS object)
    else if (contentType.includes("json") || typeof artifactFile === "object") {
      // if it's a string, try to parse it first
      let data = artifactFile;
      if (typeof artifactFile === "string") {
        try {
          data = JSON.parse(artifactFile);
        } catch (err) {
          console.error("Error parsing file: ", err);
        }
      }
      result = <pre>{JSON.stringify(data, null, 2)}</pre>; //preventing any filtering and ensuring identation of two spaces
    }
    // 4) Binary (zip, images, etc.)
    else {
      result = (
        <p>
          This is a binary file ({contentType}), please download it to see its content.
        </p>
      );
    }

    return result;
  }


  useEffect(() => {
    // Build the root node, which holds top-level folders and files
    const root: FolderNode = { name: '', isFile: false, children: {} };

    artifacts.forEach((artifact) => {

      // 1) Get the raw path string, default to empty if undefined
      const rawPath = artifact.path ?? '';

      // 2) Remove a leading "/" or "./" if present
      let cleanedPath = cleanArtifactPath(rawPath);

      // 3) Split into segments and drop any empty strings
      let segments = cleanedPath.split('/').filter((seg) => seg !== '');

      // 4) If the first segment is "artifact" or "artifacts", drop it so that
      //    "artifact/framework" becomes ["framework", ...]
      const segmentValue = segments[0]?.toLocaleLowerCase();

      if (segmentValue === 'artifact' || segmentValue === 'artifacts') {
        segments = segments.slice(1);
      }

      if (segments.length > 0) {

        let currentNode: FolderNode = root;
        createFolderSegments(segments, currentNode, artifact);

      }
    });

    setTreeData(root);
  }, [artifacts]);

  const cleanArtifactPath = (rawPath: string) => {

    let cleanedPath = rawPath;
    if (rawPath.startsWith("./")) {
      cleanedPath = rawPath.substring(2);
    } else if (rawPath.startsWith("/")) {
      cleanedPath = rawPath.substring(1);
    }

    return cleanedPath;

  };

  const createFolderSegments = (segments: string[], currentNode: FolderNode, artifact: ArtifactIndexEntry) => {
    return segments.forEach((segment, idx) => {
      const isLast = idx === segments.length - 1;

      if (isLast) {
        // It’s a file: insert a FileNode under currentNode.children
        currentNode.children[segment] = {
          name: segment,
          runId: artifact.runId ?? '',
          url: artifact.path ?? '',
          isFile: true,
          children: {},
        };
      } else {
        // It’s a folder: create or reuse a FolderNode
        const existing = currentNode.children[segment];

        if (!existing) {
          // Create new folder if it doesn’t exist
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
  };

  // Recursive renderer: emits a <TreeNode> for each TreeNodeData
  const renderNode = (node: TreeNodeData, path: string) => {

    let treeNode;

    if (node.isFile) {
      // Leaf file node
      treeNode = <TreeNode
        key={path}
        id={path}
        renderIcon={path.endsWith(".gz") ? Zip : Document}
        label={node.name}
        value={node.name}
        onSelect={() => downloadArtifact(runId, node.url)}
      />;
    } else {
      // Folder node: render label, then recurse on children
      treeNode = <TreeNode isExpanded={false} key={path} id={path} label={node.name} value={node.name} renderIcon={Folder}>
        {Object.values(node.children).map((child) => {
          const childPath = path ? `${path}/${child.name}` : child.name;
          return renderNode(child, childPath);
        })}
      </TreeNode>;
    }

    return treeNode;
  };

  return (
    <>
      <div className={styles.titleContainer}>
        <h3>Artifacts</h3>
        <p>An artifact is some captured state left behind once a Run has completed. Artifacts can be downloaded and viewed.</p>
      </div>
      <div className={styles.artifact}>

        <TreeView className={styles.tree} onSelect={() => { }}>
          {Object.values(treeData.children).map((child) =>
            renderNode(child, child.name)
          )}
        </TreeView>

        <div className={styles.artifactView}>

          {loading && <InlineLoading description="Downloading Artifact" iconDescription="Downloading Artifact" />}
          {error && <InlineNotification statusIconDescription="notification" kind="error" title="Something went wrong" subtitle={`There was an error downloading the artifact. It may be that the artifact is too big for this web application, try refreshing the page or downloading the test run using the 'galasactl' command-line tool.\nFor example:\ngalasactl runs download --name ${runName}`} />}

          {
            !loading && !error && (
              <div>

                <div>
                  {artifactDetails.artifactFile !== "" &&
                    <Tile className={styles.toolbar}>
                      <div>
                        <h5>{artifactDetails.fileName}</h5>
                        <p className={styles.fileSize}>
                          {artifactDetails.fileSize}
                        </p>
                      </div>
                      <div className={styles.toolbarOptions}>
                        <button type="button" onClick={handleDownloadClick} className={styles.downloadButton}>
                          <CloudDownload size={22} color='#0043ce' />
                        </button>
                      </div>
                    </Tile>
                  }
                </div>

                <pre className={styles.fileRenderer}>
                  {renderArtifactContent(artifactDetails.artifactFile, artifactDetails.contentType)}
                </pre>
              </div>
            )
          }
        </div>
      </div>
    </>
  );
}
