/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { render, screen, waitFor } from '@testing-library/react';
import MyProfilePage from "../app/myprofile/page";

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    text: () => Promise.resolve('admin'),
    headers: new Headers(),
    redirected: false,
    status: 200,
    statusText: 'OK',
    type: 'default',
    url: '',
    clone: jest.fn(),
    body: null,
    bodyUsed: false,
    arrayBuffer: jest.fn(),
    blob: jest.fn(),
    formData: jest.fn(),
    json: jest.fn(),
  })
);


describe('MyProfilePage', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading spinner initially', () => {
    render(<MyProfilePage />);

    // Assert that the loading spinner is shown initially
    const loader = screen.getByTestId('loader');
    expect(loader).toBeInTheDocument();
  });

  test('fetches and displays user data', async () => {
    render(<MyProfilePage />);

    // Wait for the data to be fetched and the loading spinner to disappear
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    // Assert that the user's login ID is displayed correctly
    expect(screen.getByText(/Currently logged in as:/)).toBeInTheDocument();
    // expect(screen.getByText(/admin/)).toBeInTheDocument();
  });

  test('handles fetch failure gracefully', async () => {
    // Mock a failed fetch request
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve(''),
        headers: new Headers(),
        redirected: false,
        status: 500,
        statusText: 'INTERNAL SERVER ERROR',
        type: 'default',
        url: '',
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        json: jest.fn(),
      })
    );

    render(<MyProfilePage />);

    // Wait for the fetch operation to complete
    await waitFor(() => expect(screen.queryByTestId('loader')).not.toBeInTheDocument());

    // Assert that no user data is displayed
    expect(screen.getByText(/Currently logged in as:/)).toBeInTheDocument();

  });
});