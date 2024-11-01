/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { UsersAPIApi } from '@/generated/galasaapi';
import { DELETE, GET } from '../../app/users/route';
import { createAuthenticatedApiConfiguration } from '../../utils/api';
import * as Constants from '@/utils/constants';
import AuthCookies from '@/utils/authCookies';
import { NextResponse } from 'next/server';

// Mock modules and dependencies
jest.mock('../../utils/api');
jest.mock('@/generated/galasaapi');

// Mock NextResponse to handle both static and instance methods
jest.mock('next/server', () => {
  const actualNextServer = jest.requireActual<typeof import('next/server')>('next/server');

  class MockNextResponse {
    body: any;
    status: number;
    headers: Headers;

    constructor(body: any, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }

    static json(data: any, init?: ResponseInit) {
      return new MockNextResponse(JSON.stringify(data), init);
    }

    async json() {
      return JSON.parse(this.body);
    }
  }

  return {
    ...actualNextServer,
    NextResponse: MockNextResponse,
  };
});

// Define the type for the mocked function
const mockedCreateAuthenticatedApiConfiguration = createAuthenticatedApiConfiguration as jest.MockedFunction<typeof createAuthenticatedApiConfiguration>;
const mockedUsersAPIApi = UsersAPIApi as jest.MockedClass<typeof UsersAPIApi>;

const deleteMock = jest.fn();

// Mock out the cookies() functions in the "next/headers" module
jest.mock('next/headers', () => ({
  ...jest.requireActual('next/headers'),
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('abc'),
    delete: deleteMock,
  })),
}));

describe('GET function', () => {
  const mockBearerToken = 'mocked_bearer_token';
  const mockApiConfiguration = {
    baseServer: { url: 'http://mock-server-url' }, // Mock the baseServer property
    httpApi: {}, // Mock the httpApi property (could be more detailed)
    middleware: [], // Mock the middleware array
    authMethods: {}, // Mock the authMethods object
  };

  const mockUserResponse = {
    url: 'http://mock-user-url',
    loginId: 'mock_login_id',
    clients: [
      { clientName: 'client1', lastLogin: 'Client 1' },
      { clientName: 'client2', lastLogin: 'Client 2' },
    ],
    id: 'mock_user_id',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock the API configuration creation
    mockedCreateAuthenticatedApiConfiguration.mockReturnValue(mockApiConfiguration as any);

    // Mock the getUserByLoginId method to return the mockUserResponse
    mockedUsersAPIApi.prototype.getUserByLoginId = jest.fn().mockResolvedValue([
      mockUserResponse,
    ]);
  });

  it('should return the loginId with a 200 status code when successful', async () => {
    // Invoke the GET function without any arguments
    const result = await GET();

    const data = await result.json();

    // Assertions
    expect(mockedCreateAuthenticatedApiConfiguration).toHaveBeenCalled();
    expect(mockedUsersAPIApi.prototype.getUserByLoginId).toHaveBeenCalledWith(Constants.CLIENT_API_VERSION, 'me');
    expect(mockedUsersAPIApi.prototype.getUserByLoginId).toHaveBeenCalledTimes(1); // Verify internal call
    expect(result.status).toBe(200); // Verify status code
    expect(data.userData).toEqual(mockUserResponse); // Verify response body
  });

  it('should throw an error if getUserByLoginId fails', async () => {
    mockedUsersAPIApi.prototype.getUserByLoginId = jest.fn().mockRejectedValue(new Error('API Error'));

    await expect(GET()).rejects.toThrow('Failed to get login id of user');
  });
});

describe('DELETE /auth/tokens', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Fetches cookies from headers, that are not null, GIVES 204 RESPONSE', async () => {
    const response = await DELETE();

    expect(deleteMock).toBeCalledWith(AuthCookies.ID_TOKEN);
    expect(deleteMock).toBeCalledWith(AuthCookies.SHOULD_REDIRECT_TO_SETTINGS);
    expect(deleteMock).toBeCalledTimes(2);
    expect(response.status).toBe(204);
  });
});
