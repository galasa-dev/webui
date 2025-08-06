/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import Sidebar from '@/components/Sidebar';
import { render, screen } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      tokenManagement: 'Token Management',
      loggedInAs: 'You are logged in as:',
      previousLogin: 'Previous login',
      accessRoles: 'Your access roles:',
    };
    return translations[key] || key;
  },
}));

beforeEach(() => {
  render(<Sidebar />);
});

test('renders Galasa Modal Token Request', () => {
  const tokenManagementEelement = screen.getByText(/Token Management/i);
  const loginElement = screen.getByText(/You are logged in as:/i);
  const previousLoginElement = screen.getByText(/Previous login/i);
  const accessRolesElement = screen.getByText(/Your access roles:/i);
  expect(tokenManagementEelement).toBeInTheDocument();
  expect(loginElement).toBeInTheDocument();
  expect(previousLoginElement).toBeInTheDocument();
  expect(accessRolesElement).toBeInTheDocument();
});
