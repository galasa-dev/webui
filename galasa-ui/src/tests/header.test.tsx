/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageHeader from '@/components/PageHeader';
import { render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';

const mockRouter = {
  refresh: jest.fn(() => useRouter().refresh),
};

jest.mock('next/navigation', () => ({

  useRouter: jest.fn(() => mockRouter),

}));


test('renders Galasa Service header title when env NEXT_PUBLIC_GALASA_SERVICE_NAME is null or blank string', () => {

  render(<PageHeader galasaServiceName="Galasa Service" />);

  const titleElement = screen.getByText("Galasa Service");
  expect(titleElement.textContent).toBe("Galasa Service");
  expect(titleElement).toBeInTheDocument();

});


test('renders custom header when title when env NEXT_PUBLIC_GALASA_SERVICE_NAME is present', () => {

  render(<PageHeader galasaServiceName='Managers' />);

  const titleElement = screen.getByText("Managers");
  expect(titleElement.textContent).not.toBe("Galasa Service");
  expect(titleElement.textContent).toBe("Managers");
  expect(titleElement).toBeInTheDocument();

});
