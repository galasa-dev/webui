/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import PageHeaderMenu from '@/components/PageHeaderMenu';
import PageHeader from '@/components/PageHeader';
import React from 'react';

const fetchMock = jest.spyOn(global, 'fetch');

const mockRouter = {
  push: jest.fn(() => useRouter().push),
  refresh: jest.fn(() => useRouter().refresh)
};

jest.mock('next/navigation', () => ({

  useRouter: jest.fn(() => mockRouter),

}));

afterEach(() => {
  jest.clearAllMocks();
});


test('renders the header containing the header menu', () => {

  render(<PageHeader galasaServiceName='Galasa Service' />);

  const headerMenu = screen.getByTestId('header-menu');
  expect(headerMenu).toBeInTheDocument();

});

test('checking if the menu btn exists', () => {
  render(<PageHeaderMenu />);

  const menuBtn = screen.getByTestId('menu-btn');
  expect(menuBtn).toBeInTheDocument();
});

test('renders logout btn when menu btn is pressed', async () => {

  render(<PageHeaderMenu />);

  fireEvent.click(screen.getByTestId('menu-btn'));

  const logoutBtn = screen.getByTestId('logout-btn');

  expect(logoutBtn).toBeInTheDocument();
});

test('renders my profile btn when menu btn is pressed', async () => {

  render(<PageHeaderMenu />);

  fireEvent.click(screen.getByTestId('menu-btn'));

  const myProfileBtn = screen.getByTestId('my-profile-btn');

  expect(myProfileBtn).toBeInTheDocument();
});


test('clicking my profile btn redirects me to My Profle Page', async () => {
  render(<PageHeaderMenu />);

  fireEvent.click(screen.getByTestId('menu-btn'));

  const myProfileBtn = screen.getByTestId('my-profile-btn');

  expect(myProfileBtn).toBeInTheDocument();

  fireEvent.click(myProfileBtn);

  await waitFor(() => {

    expect(mockRouter.push).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

  });

});

test('clicking my settings btn redirects me to My Settings Page', async () => {
  render(<PageHeaderMenu />);

  fireEvent.click(screen.getByTestId('menu-btn'));

  const myProfileBtn = screen.getByTestId('my-settings-btn');

  expect(myProfileBtn).toBeInTheDocument();

  fireEvent.click(myProfileBtn);

  await waitFor(() => {

    expect(mockRouter.push).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

  });

});

test('clicking log out button calls handleDeleteCookieApiOperation, RESPONSE OK', async () => {

  render(<PageHeaderMenu />);

  const response = new Response(null, {
    status: 204,
    statusText: 'OK',
    headers: {
      'Content-type': 'application/json',
    },
  });

  fetchMock.mockResolvedValueOnce(response);

  fireEvent.click(screen.getByTestId('menu-btn'));  //expanding the menu items

  const logoutBtn = screen.getByTestId('logout-btn');

  expect(logoutBtn).toBeInTheDocument();

  fireEvent.click(logoutBtn);

  await waitFor(() => {


    expect(fetchMock).toBeCalledTimes(1);

    expect(mockRouter.refresh).toHaveBeenCalled();
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);

  });


});


