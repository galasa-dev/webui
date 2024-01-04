/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import RootLayout from '@/app/layout';
import { render } from '@testing-library/react';

describe('Layout', () => {
  it('renders the web UI layout', () => {
    const layout = render(<RootLayout>Hello, world!</RootLayout>);
    expect(layout).toMatchSnapshot();
  });
});
