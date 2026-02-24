/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { downloadArtifactFromServer, updateRunTags } from '@/actions/runsAction';
import * as apiUtils from '@/utils/api';
import * as galasaapi from '@/generated/galasaapi';
import { CLIENT_API_VERSION } from '@/utils/constants/common';

jest.mock('@/utils/api');
jest.mock('@/generated/galasaapi');

describe('downloadArtifactFromServer', () => {
  const runId = 'run-xyz';
  const artifactUrl = '/some/path';
  let createConfigMock: jest.Mock;
  let getArtifactMock: jest.Mock;

  beforeEach(() => {
    createConfigMock = (apiUtils.createAuthenticatedApiConfiguration as jest.Mock).mockReturnValue({
      basePath: 'https://api.test',
      apiKey: 'fake-key',
    });
    getArtifactMock = jest.fn();
    (galasaapi.ResultArchiveStoreAPIApi as jest.Mock).mockImplementation(() => ({
      getRasRunArtifactByPath: getArtifactMock,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('parses valid JSON payload', async () => {
    const payload = { hello: 'world' };
    const jsonString = JSON.stringify(payload);

    // build an ArrayBuffer from the Buffer
    const buf = Buffer.from(jsonString, 'utf-8');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    const expectedBase64 = buf.toString('base64');

    getArtifactMock.mockResolvedValue({
      type: 'application/json; charset=utf-8',
      size: buf.length,
      arrayBuffer: () => Promise.resolve(ab),
    });

    const result = await downloadArtifactFromServer(runId, artifactUrl);

    expect(createConfigMock).toHaveBeenCalled();
    expect(galasaapi.ResultArchiveStoreAPIApi).toHaveBeenCalledWith(
      createConfigMock.mock.results[0].value
    );
    expect(getArtifactMock).toHaveBeenCalledWith(runId, artifactUrl, CLIENT_API_VERSION);

    expect(result).toMatchObject({
      contentType: 'application/json; charset=utf-8',
      data: payload,
      size: buf.length,
      base64: expectedBase64,
    });
  });

  it('falls back to raw string on invalid JSON', async () => {
    const notJson = 'just plain text';
    const buf = Buffer.from(notJson, 'utf-8');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    getArtifactMock.mockResolvedValue({
      type: 'application/json',
      size: buf.length,
      arrayBuffer: () => Promise.resolve(ab),
    });

    const result = await downloadArtifactFromServer(runId, artifactUrl);

    expect(result.contentType).toBe('application/json');
    expect(result.size).toBe(buf.length);
    expect(result.base64).toBe(buf.toString('base64'));
    expect(result.data).toBe(notJson);
  });

  it('handles non-JSON content as UTF-8 text', async () => {
    const text = 'some plain artifact';
    const buf = Buffer.from(text, 'utf-8');
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

    getArtifactMock.mockResolvedValue({
      type: 'text/plain',
      size: buf.length,
      arrayBuffer: () => Promise.resolve(ab),
    });

    const result = await downloadArtifactFromServer(runId, artifactUrl);

    expect(result.contentType).toBe('text/plain');
    expect(result.size).toBe(buf.length);
    expect(result.base64).toBe(buf.toString('base64'));
    expect(result.data).toBe(text);
  });
});

describe('updateRunTags', () => {
  const runId = 'run-123';
  const tags = ['smoke', 'regression'];
  let createConfigMock: jest.Mock;
  let putTagsMock: jest.Mock;

  beforeEach(() => {
    createConfigMock = (apiUtils.createAuthenticatedApiConfiguration as jest.Mock).mockReturnValue({
      basePath: 'https://api.test',
      apiKey: 'fake-key',
    });
    putTagsMock = jest.fn();
    (galasaapi.ResultArchiveStoreAPIApi as jest.Mock).mockImplementation(() => ({
      putRasRunTagsOrStatusById: putTagsMock,
    }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('successfully updates tags', async () => {
    putTagsMock.mockResolvedValue(undefined);

    const result = await updateRunTags(runId, tags);

    expect(createConfigMock).toHaveBeenCalled();
    expect(galasaapi.ResultArchiveStoreAPIApi).toHaveBeenCalledWith(
      createConfigMock.mock.results[0].value
    );
    expect(putTagsMock).toHaveBeenCalledWith(runId, { tags });
    expect(result).toEqual({
      success: true,
      tags,
    });
  });

  it('returns error when API call fails', async () => {
    const errorMessage = 'Network error';
    putTagsMock.mockRejectedValue(new Error(errorMessage));

    const result = await updateRunTags(runId, tags);

    expect(createConfigMock).toHaveBeenCalled();
    expect(putTagsMock).toHaveBeenCalledWith(runId, { tags });
    expect(result).toEqual({
      success: false,
      error: errorMessage,
    });
  });

  it('handles error without message', async () => {
    putTagsMock.mockRejectedValue(new Error());

    const result = await updateRunTags(runId, tags);

    expect(result).toEqual({
      success: false,
      error: 'Failed to update tags',
    });
  });

  it('handles empty tags array', async () => {
    putTagsMock.mockResolvedValue(undefined);

    const result = await updateRunTags(runId, []);

    expect(putTagsMock).toHaveBeenCalledWith(runId, { tags: [] });
    expect(result).toEqual({
      success: true,
      tags: [],
    });
  });
});
