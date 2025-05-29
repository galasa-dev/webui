/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { act, render, screen, waitFor } from '@testing-library/react';
import MyProfilePage from '../app/myprofile/page';
import { RBACRole, UsersAPIApi } from '@/generated/galasaapi';

const mockUsersApi = UsersAPIApi as jest.Mock;

jest.mock('@/generated/galasaapi');

describe('MyProfilePage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', async () => {
    // When...
    render(<MyProfilePage />);

    // Assert that the loading spinner is shown initially
    const loader = screen.getByTestId('loader');
    expect(loader).toBeInTheDocument();
  });

  test('fetches and displays user data', async () => {
    // Given...
    const expectedLoginId = 'testuser';
    const expectedRoleName = 'tester';

    const mockRole: RBACRole = {
      apiVersion: "v1",
      kind: "GalasaRole",
      metadata: {
        name: expectedRoleName,
        description: 'a dummy role for tests'
      },
      data: {}
    };

    mockUsersApi.mockReturnValue({
      getUserByLoginId: jest.fn().mockResolvedValue([{
        loginId: expectedLoginId,
        role: '1',
        synthetic: {
          role: mockRole,
        }
      }]),
    });

    // When...
    await act(async () => {
      return render(<MyProfilePage />);
    });

    // Wait for the data to be fetched and the loading spinner to disappear
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    // Then...
    // Assert that the user's login ID is displayed correctly
    expect(screen.getByText(`Currently logged in as: ${expectedLoginId}`)).toBeInTheDocument();
    expect(screen.getByText(`Role: ${expectedRoleName}`)).toBeInTheDocument();
  });

  test('handles fetch failure gracefully', async () => {
    // Given...
    mockUsersApi.mockReturnValue({
      getUserByLoginId: jest.fn().mockRejectedValue(new Error('Something went wrong!')),
    });

    // When...
    await act(async () => {
      return render(<MyProfilePage />);
    });

    // Wait for the fetch operation to complete
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    // Then...
    // Assert that no user data is displayed
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });
});
