/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserRoleSection from '../../components/users/UserRoleSection';
import { UserData } from '@/generated/galasaapi';

// --- Mocks for Carbon Components and ErrorPage --- //
jest.mock('@carbon/react', () => ({
  ButtonSet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Button: (props: any) => <button {...props}>{props.children}</button>,
  Dropdown: (props: any) => (
    // A simple select element that calls onChange with the selected item.
    <select
      data-testid="dropdown"
      onChange={(e) =>
        props.onChange({ selectedItem: props.items[Number(e.target.value)] })
      }
    >
      {props.items.map((item: any, index: number) => (
        <option key={item.id} value={index}>
          {item.name}
        </option>
      ))}
    </select>
  ),
  Loading: (props: any) => <div data-testid="loading">Loading...</div>,
  InlineNotification: (props: any) => (
    <div data-testid="notification">{props.title}</div>
  ),
}));

jest.mock('@/app/error/page', () => {
  const ErrorPage = () => <div data-testid="error-page">Error</div>;
  ErrorPage.displayName = 'ErrorPage';
  return ErrorPage;
});

// --- Dummy Data --- //
const dummyProfile: UserData = {
  id: '123',
  loginId: 'testuser',
  synthetic: {
    role: {
      metadata: {
        id: '1',
        name: 'tester',
        description: 'Test developer and runner',
      },
    },
  },
};

describe('UserRoleSection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('displays loading indicator while waiting for user profile', async () => {
    jest.useFakeTimers();

    const userProfilePromise = new Promise<UserData>((resolve) => {
      setTimeout(() => resolve(dummyProfile), 1000);
    });

    render(<UserRoleSection userProfilePromise={userProfilePromise} />);
    // Initially, the loading indicator should be visible.
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Fast-forward timers to resolve the promise.
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Wait for the user profile details to appear.
    await waitFor(() => {
      expect(screen.getByText(dummyProfile.loginId!)).toBeInTheDocument();
    });
    jest.useRealTimers();
  });

  test('displays error page if userProfilePromise rejects', async () => {
    // Suppress error logging.
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const errorPromise = Promise.reject('Error');

    render(<UserRoleSection userProfilePromise={errorPromise} />);

    await waitFor(() => {
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });
  });

  test('renders user profile details after successful load', async () => {
    render(<UserRoleSection userProfilePromise={Promise.resolve(dummyProfile)} />);

    await waitFor(() => {
      expect(screen.getByText(dummyProfile.loginId!)).toBeInTheDocument();
    });
    // Also check for a header that is part of the component.
    expect(screen.getByText('User Role')).toBeInTheDocument();
  });

  test('enables reset and save buttons when role is changed', async () => {
    render(<UserRoleSection userProfilePromise={Promise.resolve(dummyProfile)} />);

    await waitFor(() => {
      expect(screen.getByText(dummyProfile.loginId!)).toBeInTheDocument();
    });

    const resetButton = screen.getByText('Reset') as HTMLButtonElement;
    const saveButton = screen.getByText('Save') as HTMLButtonElement;
    // Initially, both buttons are disabled.
    expect(resetButton).toBeDisabled();
    expect(saveButton).toBeDisabled();

    // Change the dropdown selection to a different role.
    // In our mock, "tester" is at index 0 and "admin" is at index 1.
    const dropdown = screen.getByTestId('dropdown') as HTMLSelectElement;
    fireEvent.change(dropdown, { target: { value: '1' } });

    // Now the buttons should be enabled.
    expect(resetButton).not.toBeDisabled();
    expect(saveButton).not.toBeDisabled();
  });

  test('save button calls updateUserRole and shows success notification on successful fetch', async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    (global.fetch as jest.Mock) = mockFetch;

    render(<UserRoleSection userProfilePromise={Promise.resolve(dummyProfile)} />);
    await waitFor(() => {
      expect(screen.getByText(dummyProfile.loginId!)).toBeInTheDocument();
    });

    const dropdown = screen.getByTestId('dropdown') as HTMLSelectElement;
    const saveButton = screen.getByText('Save') as HTMLButtonElement;

    // Change the dropdown selection to "admin" (index 1).
    fireEvent.change(dropdown, { target: { value: '1' } });

    // Click the save button.
    fireEvent.click(saveButton);

    // Wait for the fetch call.
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/users/edit/updateUserRole',
        expect.objectContaining({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    // Wait for the success notification to appear.
    await waitFor(() => {
      expect(screen.getByTestId('notification')).toBeInTheDocument();
      expect(screen.getByTestId('notification')).toHaveTextContent('Success');
    });

    // After a successful save, the buttons should be disabled.
    expect(saveButton).toBeDisabled();
    const resetButton = screen.getByText('Reset') as HTMLButtonElement;
    expect(resetButton).toBeDisabled();
  });

  test('displays error page if updateUserRole fetch fails', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Failed'));
    (global.fetch as jest.Mock) = mockFetch;

    render(<UserRoleSection userProfilePromise={Promise.resolve(dummyProfile)} />);
    await waitFor(() => {
      expect(screen.getByText(dummyProfile.loginId!)).toBeInTheDocument();
    });

    const dropdown = screen.getByTestId('dropdown') as HTMLSelectElement;
    const saveButton = screen.getByText('Save') as HTMLButtonElement;
    fireEvent.change(dropdown, { target: { value: '1' } });
    fireEvent.click(saveButton);

    // When the fetch fails, the component sets isError to true and renders the ErrorPage.
    await waitFor(() => {
      expect(screen.getByTestId('error-page')).toBeInTheDocument();
    });
  });
});
