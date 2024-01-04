/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import HomePage from '@/app/page';
import PageHeader from '@/components/PageHeader';
import { act, render, screen } from '@testing-library/react';

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('')
  }))
}))

test('renders Galasa Ecosystem header', () => {
  render(<PageHeader />);
  const titleElement = screen.getByText(/Galasa Ecosystem/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Galasa Ecosystem homepage', async () => {
  const homePage = await act(async () => {
    return render(<HomePage />);
  });
  expect(homePage).toMatchSnapshot();
});
