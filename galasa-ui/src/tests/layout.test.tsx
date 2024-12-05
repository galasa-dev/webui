/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import RootLayout from '@/app/layout';
import { render } from '@testing-library/react';
import { useRouter } from 'next/navigation';

describe('Layout', () => {
  it('renders the web UI layout', () => {
    const layout = render(<RootLayout>Hello, world!</RootLayout>);
    expect(layout).toMatchSnapshot();
  });
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_GALASA_SERVICE_NAME;
});

const mockRouter = {
  refresh: jest.fn(() => useRouter().refresh),
};

jest.mock('next/navigation', () => ({

  useRouter: jest.fn(() => mockRouter),

}));

test('renders Galasa Service title when env NEXT_PUBLIC_GALASA_SERVICE_NAME is null or blank string', () => {

  process.env.NEXT_PUBLIC_GALASA_SERVICE_NAME = "";  //mocking environment variable

  render(<RootLayout>
    Hello, world!
  </RootLayout>);

  const titleElement = document.querySelector('title')?.textContent;
  expect(titleElement).toBe("Galasa Service");


});

test('renders custom title when env NEXT_PUBLIC_GALASA_SERVICE_NAME is not present (not null or blank)', () => {

  process.env.NEXT_PUBLIC_GALASA_SERVICE_NAME = 'Managers'; //mocking environment variable
  render(<RootLayout>Hello, world!</RootLayout>);

  const titleElement = document.querySelector('title')?.textContent;


  expect(titleElement).not.toBe("Galasa Service");
  expect(titleElement).toBe("Managers");

});