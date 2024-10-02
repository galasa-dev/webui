/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import HomePage from '@/app/page';
import PageHeader from '@/components/PageHeader';
import { act, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue('')
  }))
}));

const mockRouter = {
  refresh : jest.fn(() => useRouter().refresh),
};

jest.mock('next/navigation', () => ({

  useRouter: jest.fn(() => mockRouter),

}));

test('renders Galasa header', () => {
  render(<PageHeader galasaServiceName='Galasa Service'/>);

  const titleElement = screen.getByText('Galasa Service');
  expect(titleElement).toBeInTheDocument();
});

test('renders Galasa Ecosystem homepage', async () => {
  const homePage = await act(async () => {
    return render(<HomePage />);
  });
  expect(homePage).toMatchSnapshot();
});
