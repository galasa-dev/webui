/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { GET } from '@/app/internal-api/test-runs/[runId]/artifacts/route';
import { fetchTestArtifacts } from '@/utils/testRuns';
import { NextRequest } from 'next/server';

jest.mock('@/utils/testRuns', () => ({
  fetchTestArtifacts: jest.fn(),
}));

const mockFetchTestArtifacts = fetchTestArtifacts as jest.Mock;

jest.mock('next/server', () => {
  const original = jest.requireActual('next/server');
  return {
    ...original,
    NextResponse: {
      json: (data: unknown, init?: { status?: number }) =>
        new Response(JSON.stringify(data), {
          status: init?.status ?? 200,
          headers: { 'Content-Type': 'application/json' },
        }),
    },
  };
});

describe('GET /internal-api/test-runs/[runId]/artifacts', () => {
  const mockRunId = 'test-run-123';
  const mockRequest = new NextRequest(
    'http://myhost/internal-api/test-runs/test-run-123/artifacts'
  );

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected error tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return artifacts successfully', async () => {
    const mockArtifacts = [
      { path: '/log/debug.log', contentType: 'text/plain' },
      { path: '/images/screenshot.png', contentType: 'image/png' },
    ];

    mockFetchTestArtifacts.mockResolvedValue(mockArtifacts);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchTestArtifacts).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(mockArtifacts);
  });

  test('should return empty array when no artifacts exist', async () => {
    mockFetchTestArtifacts.mockResolvedValue([]);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchTestArtifacts).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual([]);
  });

  test('should handle errors and return 500 status', async () => {
    const mockError = new Error('Failed to fetch artifacts from server');
    mockFetchTestArtifacts.mockRejectedValue(mockError);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchTestArtifacts).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch artifacts' });
    expect(console.error).toHaveBeenCalledWith('Error fetching artifacts:', mockError);
  });

  test('should handle network errors', async () => {
    const networkError = new Error('Network request failed');
    mockFetchTestArtifacts.mockRejectedValue(networkError);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch artifacts' });
  });

  test('should handle different runId values', async () => {
    const differentRunId = 'different-run-456';
    const mockArtifacts = [{ path: '/data/results.json', contentType: 'application/json' }];

    mockFetchTestArtifacts.mockResolvedValue(mockArtifacts);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: differentRunId }),
    });

    expect(mockFetchTestArtifacts).toHaveBeenCalledWith(differentRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(mockArtifacts);
  });
});
