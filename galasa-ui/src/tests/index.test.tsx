/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import HomePage from '@/app/page';
import PageHeader from '@/components/headers/PageHeader';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { act, render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const mockTranslations: Record<string, string> = {
      "title": "Home",
     
    };
    return mockTranslations[key] || key;
  }
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "title": "Home",
  };
    return translations[key] || key;
  }
}));


jest.mock('fs/promises', () => ({
  readFile: jest.fn(() => Promise.resolve('Dummy markdown content'))
}));

jest.mock('path', () => ({
  join: jest.fn(() => '/mocked/path/to/home-contents.md')
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
}));


test('renders Galasa header', () => {
  render(
    <FeatureFlagProvider>
      <PageHeader galasaServiceName='Galasa Service'/>
    </FeatureFlagProvider>
  );

  const titleElement = screen.getByText('Galasa');
  expect(titleElement).toBeInTheDocument();
});

test('renders Galasa Ecosystem homepage', async () => {
  const homePage = await act(async () => {
    return render(
      <FeatureFlagProvider>
        <HomePage />
      </FeatureFlagProvider>);
  });
  expect(homePage).toMatchSnapshot();
});
