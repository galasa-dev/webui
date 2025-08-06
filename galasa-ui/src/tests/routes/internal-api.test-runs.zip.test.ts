/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { GET } from '@/app/internal-api/test-runs/[runId]/zip/route';
import { downloadArtifactFromServer } from '@/actions/runsAction';
import { cleanArtifactPath } from '@/utils/artifacts';
import { fetchRunDetailLogs, fetchTestArtifacts } from '@/utils/testRuns';
import { NextRequest } from 'next/server';

// Mock the dependencies
jest.mock('@/actions/runsAction');
jest.mock('@/utils/artifacts');
jest.mock('@/utils/testRuns');

// Mock the JSZip library
const mockZipFile = jest.fn();
const mockGenerateAsync = jest.fn().mockResolvedValue('mock-zip=blob');
jest.mock('jszip', () => {
  return jest.fn().mockImplementation(() => ({
    file: mockZipFile,
    generateAsync: mockGenerateAsync,
  }));
});

const mockDownloadArtifactFromServer = downloadArtifactFromServer as jest.Mock;
const mockCleanArtifactPath = cleanArtifactPath as jest.Mock;
const mockFetchRunDetailLogs = fetchRunDetailLogs as jest.Mock;
const mockFetchTestArtifacts = fetchTestArtifacts as jest.Mock;

describe('GET /internal-api/test-runs/[runId]/zip', () => {
  beforeEach(() => {
    mockGenerateAsync.mockClear();
    jest.clearAllMocks();
  });
  const mockRunName = 'TestRun';
  const mockRunId = '12345';

  test('should create a zip file with run log and artifacts and returns it correctly', async () => {
    // Arrange: Set up the expected return values for all mocked functions
    const mockLogContent = 'Log Content';
    const mockArtifacts = [{ path: '/log/debug.log' }, { path: 'images/screenshot.png' }];
    const mockArtifactContent = { base64: 'BASE64_MOCK_CONTENT' };
    const mockZipBuffer = Buffer.from('this-is-the-mock-zip-file');

    mockFetchRunDetailLogs.mockResolvedValue(mockLogContent);
    mockFetchTestArtifacts.mockResolvedValue(mockArtifacts);
    mockDownloadArtifactFromServer.mockResolvedValue(mockArtifactContent);
    mockCleanArtifactPath.mockImplementation((path: string) => path.replace(/^\//, ''));
    mockGenerateAsync.mockResolvedValue(mockZipBuffer);

    const request = new NextRequest(`http://localhost/internal-api?runName=${mockRunName}`);
    const context = { params: { runId: mockRunId } };

    // Act: Call the route handler
    const response = await GET(request, context);

    // Assert: Verify that all functions are called as expected
    expect(mockFetchRunDetailLogs).toHaveBeenCalledWith(mockRunId);
    expect(mockFetchTestArtifacts).toHaveBeenCalledWith(mockRunId);
    expect(mockDownloadArtifactFromServer).toHaveBeenCalledTimes(2);
    expect(mockDownloadArtifactFromServer).toHaveBeenCalledWith(mockRunId, mockArtifacts[0].path);
    expect(mockDownloadArtifactFromServer).toHaveBeenCalledWith(mockRunId, mockArtifacts[1].path);
    expect(mockCleanArtifactPath).toHaveBeenCalledWith(mockArtifacts[0].path);
    expect(mockCleanArtifactPath).toHaveBeenCalledWith(mockArtifacts[1].path);
    expect(mockGenerateAsync).toHaveBeenCalled();

    // Assert: Verify the response
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/zip');
  });

  test('should return a 500 error if fetching data fails', async () => {
    // Arrange: Simulate a failure in one of the initial data fetches
    const apiError = new Error('Database connection failed');
    mockFetchTestArtifacts.mockRejectedValue(apiError);

    const request = new NextRequest(`http://localhost/internal-api?runName=${mockRunName}`);
    const context = { params: { runId: mockRunId } };

    // Act
    const response = await GET(request, context);
    const responseBody = await response.json();

    // Assert
    expect(response.status).toBe(500);
    expect(responseBody).toEqual({ error: 'Failed to generate the zip file on the server.' });
  });

  test('should use a fallback filename if runName is not provided', async () => {
    // Arrange
    mockFetchRunDetailLogs.mockResolvedValue('');
    mockFetchTestArtifacts.mockResolvedValue([]);
    mockGenerateAsync.mockResolvedValue(Buffer.from(''));

    // Simulate a request without a query parameter
    const request = new NextRequest('http://localhost/internal-api');
    const params = { params: { runId: mockRunId } };

    // Act
    const response = await GET(request, params);

    // Assert
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Disposition')).toBe('attachment; filename="test-run.zip"');
  });
});
