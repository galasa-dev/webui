/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen } from '@testing-library/react';
import PageHeader from '@/components/headers/PageHeader';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';
import { useRouter } from 'next/navigation';

const mockRouter = {
  push: jest.fn(() => useRouter().push),
  refresh: jest.fn(() => useRouter().refresh),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));
jest.mock('@/utils/locale', () => ({
  setUserLocale: jest.fn(), // mock the function
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      profile: 'My Profile',
      settings: 'My Settings',
      logout: 'Log out',
      users: 'Users',
      testRuns: 'Test runs',
    };
    return translations[key] || `Translated ${key}`;
  },
  useLocale: () => 'en',
  NextIntlClientProvider: ({ children }: any) => <>{children}</>,
}));

afterEach(() => {
  jest.clearAllMocks();
});

test('renders the header containing the header menu', () => {
  render(
    <FeatureFlagProvider>
      <PageHeader galasaServiceName="Galasa Service" />
    </FeatureFlagProvider>
  );

  const headerMenu = screen.getByTestId('header-menu');
  expect(headerMenu).toBeInTheDocument();
});

test('renders the "Test runs" link by default', () => {
  render(
    <FeatureFlagProvider>
      <PageHeader galasaServiceName="Galasa Service" />
    </FeatureFlagProvider>
  );

  // Verify "Test runs" link appears in both desktop header nav and mobile side nav
  const testRunsLinks = screen.getAllByRole('link', { name: 'Test runs' });
  expect(testRunsLinks).toHaveLength(2);

  // Both links should point to the correct href
  testRunsLinks.forEach((link) => {
    expect(link).toHaveAttribute('href', '/test-runs');
  });

  // Verify one is in the header navigation (desktop)
  const headerNav = screen.getByRole('navigation', { name: 'Galasa menu bar navigation' });
  expect(headerNav).toContainElement(testRunsLinks[0]);

  // Verify one is in the side navigation (mobile)
  const sideNav = screen.getByRole('navigation', { name: 'Side navigation' });
  expect(sideNav).toContainElement(testRunsLinks[1]);
});
