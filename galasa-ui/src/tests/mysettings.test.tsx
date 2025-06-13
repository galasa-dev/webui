/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import MySettings from '@/app/mysettings/page';
import { UsersAPIApi } from '@/generated/galasaapi';
import { render, screen } from '@testing-library/react';

// --- Mocks ---

jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn((name: string) => {
      if (name === 'CLIENT_ID') return { value: 'dummyClientId' };
      if (name === 'REFRESH_TOKEN') return { value: 'dummyRefreshToken' };
      return null;
    }),
    delete: jest.fn(),
  }),
}));


jest.mock('@/generated/galasaapi', () => {
  return {
    UsersAPIApi: jest.fn(),
  };
});

jest.mock('@/utils/api', () => ({
  createAuthenticatedApiConfiguration: () => ({}),
}));

jest.mock('@/actions/getUserAccessTokens', () => ({
  fetchAccessTokens: jest.fn().mockResolvedValue({ tokens: [] }),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "title": "Experimental Features",
      "description": "Early access to new features. These are experimental and subject to change or removal.",
      "features.testRunSearch": "Test Run searching and viewing",
      "errorTitle": "Something went wrong!",
      "errorDescription": "Please report the problem to your Galasa Ecosystem administrator."
    };
    return translations[key] || key;
  }
}));


describe('MySettings Component', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders ErrorPage when user login id is not found', async () => {
    const mockedGetUserByLoginId = jest.fn().mockResolvedValue([]);
    (UsersAPIApi as jest.Mock).mockImplementation(() => ({
      getUserByLoginId: mockedGetUserByLoginId,
    }));
  
    const Component = await MySettings();
    render(Component);

    expect(screen.getByText("Something went wrong!")).toBeInTheDocument();
  });
  

  test('renders correctly when user login id is found', async () => {

    const fakeUser = { loginId: 'user123' };
    const mockedGetUserByLoginId = jest.fn().mockResolvedValue([fakeUser]);
    (UsersAPIApi as jest.Mock).mockImplementation(() => ({
      getUserByLoginId: mockedGetUserByLoginId,
    }));

    const result = await MySettings();
    expect(result).toMatchSnapshot();
  });
});
