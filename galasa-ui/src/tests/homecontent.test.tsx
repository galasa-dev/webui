/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { act, render, screen } from '@testing-library/react';
import HomeContent from '@/components/HomeContent';
import { useRouter } from 'next/navigation';

// Mock out the native time functions to so that we can control time as needed
jest.useFakeTimers();

afterEach(() => {
  jest.resetAllMocks();
});

const mockRouter = {
  refresh: jest.fn(() => useRouter().refresh),
};

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
}));
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      modalHeading: 'Insufficient Permissions',
      logoutButton: 'Log out',
      notificationSubtitle:
        'You have access to the Galasa service, but your user role does not have sufficient permissions to perform this operation.',
      helpText:
        'If this is a problem, contact your Galasa service administrator and ask to be assigned a role with the required permissions.',
    };
    return translations[key] || key;
  },
}));

test('renders markdown content', async () => {
  // Given...
  const mockMarkdownContent = Promise.resolve({
    markdownContent: '# Mocked Markdown Content This is a test',
    responseStatusCode: 200,
  });

  // When...
  render(<HomeContent markdownContentPromise={mockMarkdownContent} />);

  // Then...
  const content = await screen.findByText('Mocked Markdown Content This is a test');
  expect(content).toBeInTheDocument();
});

test('render home content title', async () => {
  // Given...
  const mockMarkdownContent = Promise.resolve({
    markdownContent: '# Mocked Markdown Content This is a test',
    responseStatusCode: 200,
  });

  // When...
  render(<HomeContent markdownContentPromise={mockMarkdownContent} />);
  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  // Then...
  const title = screen.getByText('Mocked Markdown Content This is a test');

  expect(title).toBeInTheDocument();
  expect(title).toBeInstanceOf(HTMLHeadingElement);
  expect(title.tagName).toBe('H1');
});

test('render home content sub-title', async () => {
  // Given...
  const mockMarkdownContent = Promise.resolve({
    markdownContent: `
# This is a title
## This is a subtitle
  `,
    responseStatusCode: 200,
  });

  // When...
  render(<HomeContent markdownContentPromise={mockMarkdownContent} />);

  await act(async () => {
    jest.advanceTimersByTime(1000);
  });

  // Then...
  const subtitle = screen.getByText('This is a subtitle');

  expect(subtitle).toBeInTheDocument();
  expect(subtitle).toBeInstanceOf(HTMLHeadingElement);
  expect(subtitle.tagName).toBe('H2');
});
