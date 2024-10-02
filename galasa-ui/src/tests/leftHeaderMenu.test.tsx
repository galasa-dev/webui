/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import LeftHeaderMenu from '@/components/LeftHeaderMenu';


const mockRouter = {
  push: jest.fn(() => useRouter().push),
};

jest.mock('next/navigation', () => ({

  useRouter: jest.fn(() => mockRouter),

}));

afterEach(() => {
  jest.clearAllMocks();
});


test('checking if the left menu btn exists', () => {
  render(<LeftHeaderMenu />);

  const menuBtn = screen.getByTestId('left-menu-btn');
  expect(menuBtn).toBeInTheDocument();
});


test('renders home btn when menu btn is pressed', async () => {

  render(<LeftHeaderMenu />);

  fireEvent.click(screen.getByTestId('left-menu-btn'));

  const homeBtn = screen.getByTestId('home-btn');

  expect(homeBtn).toBeInTheDocument();
});

test('clicking my profile btn redirects me to home page', async () => {
  render(<LeftHeaderMenu />);

  fireEvent.click(screen.getByTestId('left-menu-btn'));

  const homeBtn = screen.getByTestId('home-btn');

  expect(homeBtn).toBeInTheDocument();

  fireEvent.click(homeBtn);

  await waitFor(() => {

    expect(mockRouter.push).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith("/");
    expect(mockRouter.push).toHaveBeenCalledTimes(1);

  });

});

