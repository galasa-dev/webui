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
