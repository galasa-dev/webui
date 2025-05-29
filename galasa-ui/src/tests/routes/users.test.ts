/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { DELETE } from '../../app/logout/route';
import AuthCookies from '@/utils/authCookies';

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
