/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UsersTable from '@/components/users/UsersTable';
import { UserData } from '@/generated/galasaapi';
import '@testing-library/jest-dom';
import { deleteUserFromService } from '@/actions/userServerActions';

// ------------------------------
// Mocks
// ------------------------------

// Mock Carbon's Loading component to render a simple div.
jest.mock('@carbon/react', () => {
  const originalModule = jest.requireActual('@carbon/react');
  return {
    __esModule: true,
    ...originalModule,
    Loading: () => <div data-testid="loading">Loading...</div>
  };
});

let deleteUserByNumberMock: jest.Mock;

deleteUserByNumberMock = jest.fn();


// ------------------------------
// Tests
// ------------------------------
describe('UsersTable component', () => {
  test('displays loading spinner while fetching data', async () => {
    // Create a promise that never resolves to simulate the loading state.
    const pendingPromise: Promise<UserData[]> = new Promise(() => { });
    const currentUserPendingPromise: Promise<UserData> = new Promise(() => { });
    render(<UsersTable usersListPromise={pendingPromise} currentUserPromise={currentUserPendingPromise} />);

    // The Loading component should be rendered.
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('renders table with user data after promise resolves', async () => {
    // Sample user data with both "web-ui" and "rest-api" clients.
    const userData: UserData[] = [
      {
        id: '1',
        loginId: 'user1',
        synthetic: {
          role: {
            metadata: { name: 'admin' }
          }
        },
        clients: [
          {
            clientName: 'web-ui',
            lastLogin: new Date('2020-01-02T00:00:00Z')
          },
          {
            clientName: 'rest-api',
            lastLogin: new Date('2020-01-03T00:00:00Z')
          }
        ]
      }
    ];

    const currentUser: UserData = {
      id: '1',
      loginId: 'user1',
      synthetic: {
        role: {
          metadata: { name: 'admin' }
        }
      },
      clients: [
        {
          clientName: 'web-ui',
          lastLogin: new Date('2020-01-02T00:00:00Z')
        },
        {
          clientName: 'rest-api',
          lastLogin: new Date('2020-01-03T00:00:00Z')
        }
      ]
    };

    const resolvedPromise: Promise<UserData[]> = Promise.resolve(userData);
    const currentUserResolvedPromise: Promise<UserData> = Promise.resolve(currentUser);

    render(<UsersTable usersListPromise={resolvedPromise} currentUserPromise={currentUserResolvedPromise} />);

    // Wait until the table header appears, indicating data has been loaded.
    await waitFor(() => {
      expect(screen.getByText('Login ID')).toBeInTheDocument();
    });

    // Check that the user data is rendered.
    expect(screen.getByText('user1')).toBeInTheDocument();
    expect(screen.getByText('admin')).toBeInTheDocument();

    // Verify that the formatted dates are rendered.
    const formattedLastLogin = "02/01/2020";
    const formattedLastAccessTokenUse = "03/01/2020";
    expect(screen.getByText(formattedLastLogin)).toBeInTheDocument();
    expect(screen.getByText(formattedLastAccessTokenUse)).toBeInTheDocument();
  });

  test('renders "n/a" for missing client data', async () => {
    // User data with missing role and no client information.
    const userData: UserData[] = [
      {
        id: '1',
        loginId: 'user1',
        synthetic: {}, // No role provided.
        clients: []    // No client data provided.
      }
    ];

    const currentUser: UserData = {
      id: '1',
      loginId: 'user1',
      synthetic: {
        role: {
          metadata: { name: 'admin' }
        }
      },
      clients: [
        {
          clientName: 'web-ui',
          lastLogin: new Date('2020-01-02T00:00:00Z')
        },
        {
          clientName: 'rest-api',
          lastLogin: new Date('2020-01-03T00:00:00Z')
        }
      ]
    };

    const resolvedPromise: Promise<UserData[]> = Promise.resolve(userData);
    const currentUserResolvedPromise: Promise<UserData> = Promise.resolve(currentUser);
    render(<UsersTable usersListPromise={resolvedPromise} currentUserPromise={currentUserResolvedPromise} />);

    // Wait for the table header to appear.
    await waitFor(() => {
      expect(screen.getByText('Login ID')).toBeInTheDocument();
    });

    // Check that the loginId is rendered.
    expect(screen.getByText('user1')).toBeInTheDocument();

    // Since role and client dates are missing, they should display "n/a".
    const naElements = screen.getAllByText('n/a');
    expect(naElements.length).toBeGreaterThanOrEqual(3);
  });

  test('handles promise rejection without showing error page (due to bug)', async () => {
    // Create a promise that rejects.
    const rejectedPromise: Promise<UserData[]> = new Promise((resolve, reject) => {
      reject(new Error('Failed to fetch'));
    });

    const currentUserResolvedPromise: Promise<UserData> = Promise.resolve({});

    render(<UsersTable usersListPromise={rejectedPromise} currentUserPromise={currentUserResolvedPromise} />);

    // Check if the Error page was rendered
    await waitFor(() => {
      expect(screen.getByText('Something went wrong!')).toBeInTheDocument();
    });
  });

  test("should throw an error if userNumber is empty", async () => {
    await expect(deleteUserFromService("")).rejects.toThrow(
      "User Number is required"
    );
  });

  test("should throw an internal server error for other errors", async () => {
    deleteUserByNumberMock.mockRejectedValueOnce({
      response: { status: 500 },
    });
    await expect(deleteUserFromService("abcd123")).rejects.toThrow(
      "Internal Server Error"
    );
  });
});
