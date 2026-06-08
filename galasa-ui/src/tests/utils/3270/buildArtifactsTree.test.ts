/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { buildArtifactsTree } from '@/utils/3270/buildArtifactsTree';
import { ArtifactIndexEntry } from '@/generated/galasaapi';
import { FolderNode, FileNode } from '@/utils/functions/artifacts';

describe('buildArtifactsTree', () => {
  it('should return an empty root node for empty artifacts array', () => {
    const result = buildArtifactsTree([]);

    expect(result).toEqual({
      name: '',
      isFile: false,
      children: {},
    });
  });

  it('should build a simple tree structure with one file', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/framework/test.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.isFile).toBe(false);
    expect(framework.children['test.txt']).toBeDefined();
    expect(framework.children['test.txt'].isFile).toBe(true);
  });

  it('should build a nested tree structure', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/framework/logs/debug.log',
        runId: 'run-123',
      },
      {
        path: '/framework/images/screenshot.png',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    const logs = framework.children.logs as FolderNode;
    expect(logs).toBeDefined();
    expect(logs.children['debug.log']).toBeDefined();
    const images = framework.children.images as FolderNode;
    expect(images).toBeDefined();
    expect(images.children['screenshot.png']).toBeDefined();
  });

  it('should remove "artifact" prefix from paths', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/artifact/framework/test.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    expect(result.children.artifact).toBeUndefined();
    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.children['test.txt']).toBeDefined();
  });

  it('should remove "artifacts" prefix from paths', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/artifacts/framework/test.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    expect(result.children.artifacts).toBeUndefined();
    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.children['test.txt']).toBeDefined();
  });

  it('should handle paths with leading slashes and dots', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: './framework/test.txt',
        runId: 'run-123',
      },
      {
        path: '/framework/test2.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.children['test.txt']).toBeDefined();
    expect(framework.children['test2.txt']).toBeDefined();
  });

  it('should handle undefined paths gracefully', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: undefined,
        runId: 'run-123',
      },
      {
        path: '/framework/test.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.children['test.txt']).toBeDefined();
  });

  it('should handle undefined runId gracefully', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/framework/test.txt',
        runId: undefined,
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    const testFile = framework.children['test.txt'] as FileNode;
    expect(testFile).toBeDefined();
    expect(testFile.runId).toBe('');
  });

  it('should replace file with folder if path conflict occurs', () => {
    const artifacts: ArtifactIndexEntry[] = [
      {
        path: '/framework',
        runId: 'run-123',
      },
      {
        path: '/framework/test.txt',
        runId: 'run-123',
      },
    ];

    const result = buildArtifactsTree(artifacts);

    const framework = result.children.framework as FolderNode;
    expect(framework).toBeDefined();
    expect(framework.isFile).toBe(false);
    expect(framework.children['test.txt']).toBeDefined();
  });
});
