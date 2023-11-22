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
  await act(async () => {
    render(<HomePage />);
  })
  const requestModalElement = screen.getByText(/request personal access token/i)
  expect(requestModalElement).toBeInTheDocument();
});
