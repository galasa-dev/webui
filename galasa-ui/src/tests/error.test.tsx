/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import ErrorPage from '@/app/error/page';
import { render } from '@testing-library/react';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "errorTitle": "Something went wrong!",
      "errorDescription": "Please report the problem to your Galasa Ecosystem administrator."
    };
    return translations[key] || key;
  }
}));
  

describe('Error page', () => {
  it('renders the error page', () => {
    const errorPage = render(<ErrorPage />);
    expect(errorPage).toMatchSnapshot();
  });
});
