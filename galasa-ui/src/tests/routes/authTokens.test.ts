/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 * @jest-environment node
 */
import * as AuthTokenRoute from '@/app/auth/tokens/route';
import { AuthenticationAPIApi, UsersAPIApi } from '@/generated/galasaapi';
import { NextRequest} from 'next/server';

const mockAuthenticationApi = AuthenticationAPIApi as jest.Mock;

const deleteMock = jest.fn();

// Mock out the cookies() functions in the "next/headers" module
jest.mock('next/headers', () => ({
  ...jest.requireActual('next/headers'),
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('abc'),
    set: jest.fn(),
    delete: deleteMock
  })),
}));

// Mock out the generated auth API client code
jest.mock('@/generated/galasaapi', () => ({
  ...jest.requireActual('@/generated/galasaapi'),
  AuthenticationAPIApi: jest.fn(() => ({
    postClients: jest.fn().mockReturnValue(
      Promise.resolve({
        clientId: 'dummy-id',
      })
    ),
    getTokens: jest.fn().mockReturnValue(
      Promise.resolve({
        tokens: [{
          tokenId: "token_123",
          description: "test_token",
          creationTime: "2024-09-23",
          owner: {
            loginId: "admin"
          }
        }]
      })
    ),
    deleteToken: jest.fn().mockReturnValue(
      Promise.resolve("Token deleted")
    )
  })),
  UsersAPIApi: jest.fn(() => ({
    getUserByLoginId: jest.fn().mockReturnValue(
      Promise.resolve([{
        loginId: "admin"
      }])
    )
  }))
}));

describe('POST /auth/tokens', () => {
  it('redirects to authenticate with the newly created Dex client', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
        headers: {
          get: jest.fn(),
        },
      })
    ) as jest.Mock;

    // When...
    const response = await AuthTokenRoute.POST(request);
    const responseJson = await response.json();

    // Then...
    expect(responseJson.url).toEqual(redirectUrl);
  });

  it('throws an error if the POST request to create a new Dex client returns an error', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    const errorMessage = 'there was an error!';
    mockAuthenticationApi.mockReturnValue({
      postClients: jest.fn(() => Promise.reject(errorMessage)),
    });

    // When/Then...
    await expect(AuthTokenRoute.POST(request)).rejects.toMatch(errorMessage);
    mockAuthenticationApi.mockReset();
  });

  it('throws an error if the newly created Dex client does not contain a client ID', async () => {
    // Given...
    const redirectUrl = 'http://my-connector/auth';

    const requestBody = JSON.stringify({
      tokenDescription: "my-token"
    });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "POST", body: requestBody });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        url: redirectUrl,
      })
    ) as jest.Mock;

    mockAuthenticationApi.mockReturnValue({
      postClients: jest.fn(() => Promise.resolve({})),
    });

    // When/Then...
    await expect(AuthTokenRoute.POST(request)).rejects.toThrow(/failed to create personal access token/i);
    mockAuthenticationApi.mockReset();
  });
});


describe('GET /auth/tokens', () => {

  it('should return 200 with serialized tokens when loginId exists', async () => {
  
    const mockResponseData = [{
      tokenId: "token_123",
      description: "test_token",
      creationTime: "2024-09-23",
      owner: {
        loginId: "admin"
      }
    }];

    mockAuthenticationApi.mockReturnValue({
      getTokens: jest.fn(() => Promise.resolve({
        tokens: [{ // Wrap the tokens array inside an object with the 'tokens' key
          tokenId: "token_123",
          description: "test_token",
          creationTime: "2024-09-23",
          owner: {
            loginId: "admin"
          }
        }]
      }))
    });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "GET" });

    const response = await AuthTokenRoute.GET(request);

    const serializedTokens = await response.json();

    expect(response.status).toEqual(200);
    expect(serializedTokens).toEqual(mockResponseData);
  });

  it('should return 400 if no loginId is provided', async () => {
    
    mockAuthenticationApi.mockReturnValue({
      getTokens: jest.fn(() => Promise.resolve([]))
    });

    const mockUserApiClient = UsersAPIApi as jest.Mock;
    mockUserApiClient.mockReturnValue({
      getUserByLoginId: jest.fn(() => Promise.resolve([])),  // Simulate no loginId returned
    });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "GET" });

    const response = await AuthTokenRoute.GET(request);
    const responseText = await response.text();
    
  
    expect(response.status).toBe(400); // Expecting 400 status code
    expect(responseText).toEqual("No login ID provided");
  });

});

describe('DELETE /auth/tokens', () => {

  it('should return 200 when token is deleted', async () => {

    mockAuthenticationApi.mockReturnValue({
      deleteToken: jest.fn().mockReturnValue(
        Promise.resolve("Token deleted")
      )
    });

    const tokenId = "testTokenId";

    const testBody = JSON.stringify({ tokenId });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "DELETE", body: testBody });

    const response = await AuthTokenRoute.DELETE(request);

    expect(response.status).toEqual(204);
    
  });

  it('should return 400 when no tokenId is provided', async () => {

    mockAuthenticationApi.mockReturnValue({
      deleteToken: jest.fn().mockReturnValue(
        Promise.resolve("Token ID is required")
      )
    });

    const tokenId = "";

    const testBody = JSON.stringify({ tokenId });

    const request = new NextRequest("https://my-server/auth/tokens", { method: "DELETE", body: testBody });

    const response = await AuthTokenRoute.DELETE(request);
    const responseText = await response.text();

    expect(response.status).toEqual(400);
    expect(responseText).toEqual("Token ID is required");
    
  });

});