/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { render, screen } from '@testing-library/react';
import TestRunsPage from '@/app/test-runs/page';
import '@testing-library/jest-dom';


// Mock component dependencies
jest.mock('@/components/PageTile', () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => <div data-testid="page-tile">{title}</div>,
}));

jest.mock('@/components/common/BreadCrumb', () => ({
  __esModule: true,
  default: () => <div data-testid="breadcrumb">BreadCrumb</div>,
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "title": "Test Runs",
      "underConstruction": "This page is under construction. Please come back later to query a list of test runs."
    };
    return translations[key] || key;
  }
}));
  
describe('TestRunsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the Test Runs page with correct components', () => {
    render(<TestRunsPage />);

    // Check for the main content container
    expect(screen.getByRole('main')).toBeInTheDocument();

    // Check for the page title
    expect(screen.getByTestId('page-tile')).toBeInTheDocument();
    expect(screen.getByText('Test Runs')).toBeInTheDocument();

    // Check for the breadcrumb component
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();

    // Check for the under construction message
    expect(screen.getByText(/under construction/i)).toBeInTheDocument();
  });
});