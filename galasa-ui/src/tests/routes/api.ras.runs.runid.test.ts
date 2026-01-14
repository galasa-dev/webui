/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { PUT } from '@/app/api/ras/runs/[runid]/route';
import { NextRequest } from 'next/server';
import { ResultArchiveStoreAPIApi } from '@/generated/galasaapi';
import { createAuthenticatedApiConfiguration } from '@/utils/api';

// Mock the dependencies
jest.mock('@/generated/galasaapi');
jest.mock('@/utils/api');

// Mock NextResponse
jest.mock('next/server', () => {
  const original = jest.requireActual('next/server');
  return {
    ...original,
    NextResponse: {
      json: (data: any, init?: any) =>
        new Response(JSON.stringify(data), {
          status: init?.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  };
});

const mockPutRasRunTagsOrStatusById = jest.fn();
const mockCreateAuthenticatedApiConfiguration = createAuthenticatedApiConfiguration as jest.Mock;

describe('PUT /api/ras/runs/[runid]', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock API configuration.
    mockCreateAuthenticatedApiConfiguration.mockReturnValue({});

    // Mock ResultArchiveStoreAPIApi.
    (ResultArchiveStoreAPIApi as jest.Mock).mockImplementation(() => ({
      putRasRunTagsOrStatusById: mockPutRasRunTagsOrStatusById,
    }));
  });

  const mockRunId = 'test-run-12345';

  test('should successfully update tags for a run', async () => {
    // Arrange
    const mockTags = ['smoke', 'regression', 'critical'];
    mockPutRasRunTagsOrStatusById.mockResolvedValue({});

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: mockTags }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(mockCreateAuthenticatedApiConfiguration).toHaveBeenCalledTimes(1);
    expect(ResultArchiveStoreAPIApi).toHaveBeenCalledWith({});
    expect(mockPutRasRunTagsOrStatusById).toHaveBeenCalledWith(mockRunId, {
      tags: mockTags,
    });
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      success: true,
      tags: mockTags,
    });
  });

  test('should handle empty tags array', async () => {
    // Arrange
    const mockTags: string[] = [];
    mockPutRasRunTagsOrStatusById.mockResolvedValue({});

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: mockTags }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(mockPutRasRunTagsOrStatusById).toHaveBeenCalledWith(mockRunId, {
      tags: [],
    });
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({
      success: true,
      tags: [],
    });
  });

  test('should return 500 error when API call fails', async () => {
    // Arrange
    const mockError = new Error('API connection failed');
    mockPutRasRunTagsOrStatusById.mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: ['test'] }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(responseBody).toEqual({
      success: false,
      error: 'API connection failed',
    });
  });

  test('should return 500 error with generic message when error has no message', async () => {
    // Arrange
    const mockError = { someProperty: 'value' }; // Error without message property
    mockPutRasRunTagsOrStatusById.mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: ['test'] }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(responseBody).toEqual({
      success: false,
      error: 'Failed to update tags',
    });
  });

  test('should handle single tag', async () => {
    // Arrange
    const mockTags = ['production'];
    mockPutRasRunTagsOrStatusById.mockResolvedValue({});

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: mockTags }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(mockPutRasRunTagsOrStatusById).toHaveBeenCalledWith(mockRunId, {
      tags: mockTags,
    });
    expect(response.status).toBe(200);
    expect(responseBody.success).toBe(true);
    expect(responseBody.tags).toEqual(mockTags);
  });

  test('should handle tags with special characters', async () => {
    // Arrange
    const mockTags = ['tag-with-dash', 'tag_with_underscore', 'tag.with.dot'];
    mockPutRasRunTagsOrStatusById.mockResolvedValue({});

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: mockTags }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    const response = await PUT(request, context);
    const responseBody = await response.json();

    // Assert
    expect(mockPutRasRunTagsOrStatusById).toHaveBeenCalledWith(mockRunId, {
      tags: mockTags,
    });
    expect(response.status).toBe(200);
    expect(responseBody.tags).toEqual(mockTags);
  });

  test('should log error to console when API call fails', async () => {
    // Arrange
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const mockError = new Error('Network error');
    mockPutRasRunTagsOrStatusById.mockRejectedValue(mockError);

    const request = new NextRequest('http://localhost/api/ras/runs/test-run-12345', {
      method: 'PUT',
      body: JSON.stringify({ tags: ['test'] }),
    });
    const context = { params: { runid: mockRunId } };

    // Act
    await PUT(request, context);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error updating run tags:', mockError);

    // Cleanup
    consoleErrorSpy.mockRestore();
  });
});
