/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import ErrorPage from '@/app/error/page';
import { render } from '@testing-library/react';

describe('Error page', () => {
  it('renders the error page', () => {
    const errorPage = render(<ErrorPage />);
    expect(errorPage).toMatchSnapshot();
  });
});
