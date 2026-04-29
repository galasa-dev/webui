/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { GET } from '@/app/internal-api/test-runs/[runId]/log/route';
import { fetchRunDetailLogs } from '@/utils/testRuns';
import { NextRequest } from 'next/server';

jest.mock('@/utils/testRuns', () => ({
  fetchRunDetailLogs: jest.fn(),
}));

const mockFetchRunDetailLogs = fetchRunDetailLogs as jest.Mock;

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

describe('GET /internal-api/test-runs/[runId]/log', () => {
  const mockRunId = 'test-run-123';
  const mockRequest = new NextRequest('http://myhost/internal-api/test-runs/test-run-123/log');

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for expected error tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should return log content successfully', async () => {
    const mockLogContent = `2024-01-01 10:00:00 INFO Starting test
2024-01-01 10:00:01 INFO Test running
2024-01-01 10:00:02 INFO Test completed`;

    mockFetchRunDetailLogs.mockResolvedValue(mockLogContent);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ log: mockLogContent });
  });

  test('should return empty log when no log content exists', async () => {
    mockFetchRunDetailLogs.mockResolvedValue('');

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ log: '' });
  });

  test('should handle large log content', async () => {
    // Create a large log with 10000 lines
    const largeLog = Array.from({ length: 10000 }, (_, i) => `Line ${i + 1}: Log entry`).join('\n');

    mockFetchRunDetailLogs.mockResolvedValue(largeLog);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ log: largeLog });
    expect(data.log.split('\n').length).toBe(10000);
  });

  test('should handle errors and return 500 status', async () => {
    const mockError = new Error('Failed to fetch log from server');
    mockFetchRunDetailLogs.mockRejectedValue(mockError);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(mockRunId);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch run log' });
    expect(console.error).toHaveBeenCalledWith('Error fetching run log:', mockError);
  });

  test('should handle network errors', async () => {
    const networkError = new Error('Network request failed');
    mockFetchRunDetailLogs.mockRejectedValue(networkError);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Failed to fetch run log' });
  });

  test('should handle different runId values', async () => {
    const differentRunId = 'different-run-456';
    const mockLogContent = 'Different test log content';

    mockFetchRunDetailLogs.mockResolvedValue(mockLogContent);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: differentRunId }),
    });

    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(differentRunId);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual({ log: mockLogContent });
  });

  test('should handle log with special characters', async () => {
    const logWithSpecialChars = `Test log with special chars: \n\t"quotes" 'apostrophes' <tags> & symbols`;

    mockFetchRunDetailLogs.mockResolvedValue(logWithSpecialChars);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ log: logWithSpecialChars });
  });

  test('should handle log with unicode characters', async () => {
    const logWithUnicode = 'Test log with unicode: 你好 🚀 émojis';

    mockFetchRunDetailLogs.mockResolvedValue(logWithUnicode);

    const response = await GET(mockRequest, {
      params: Promise.resolve({ runId: mockRunId }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ log: logWithUnicode });
  });
});
