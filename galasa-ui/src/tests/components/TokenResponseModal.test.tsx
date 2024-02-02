/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import TokenResponseModal from '@/components/TokenResponseModal';
import { act, fireEvent, render, screen } from '@testing-library/react';

describe('Token response modal', () => {
  it('renders invisible token response modal if all properties are empty', async () => {
    // Given...
    await act(async () => {
      return render(<TokenResponseModal refreshToken="" clientId="" onLoad={async () => {}} />);
    });
    const responseModalElement = screen.getByRole('presentation');

    // Then...
    expect(responseModalElement).toBeInTheDocument();
    expect(responseModalElement).not.toHaveClass('is-visible');
  });

  it('renders invisible token response modal if the clientId property is empty', async () => {
    // Given...
    await act(async () => {
      return render(<TokenResponseModal refreshToken="dummytoken" clientId="" onLoad={async () => {}} />);
    });
    const responseModalElement = screen.getByRole('presentation');

    // Then...
    expect(responseModalElement).toBeInTheDocument();
    expect(responseModalElement).not.toHaveClass('is-visible');
  });

  it('renders invisible token response modal if the refreshToken property is empty', async () => {
    // Given...
    await act(async () => {
      return render(<TokenResponseModal refreshToken="" clientId="clientId" onLoad={async () => {}} />);
    });
    const responseModalElement = screen.getByRole('presentation');

    // Then...
    expect(responseModalElement).toBeInTheDocument();
    expect(responseModalElement).not.toHaveClass('is-visible');
  });

  it('becomes visible when all required properties are provided', async () => {
    // Given...
    await act(async () => {
      return render(<TokenResponseModal refreshToken="dummytoken" clientId="dummyid" onLoad={async () => {}} />);
    });
    const responseModalElement = screen.getByRole('presentation');

    // Then...
    expect(responseModalElement).toBeInTheDocument();
    expect(responseModalElement).toHaveClass('is-visible');
  });

  it('becomes invisible when the "Close" button is clicked', async () => {
    // Given...
    await act(async () => {
      return render(<TokenResponseModal refreshToken="dummytoken" clientId="dummyid" onLoad={async () => {}} />);
    });
    const modalCloseButtonElement = screen.getByLabelText(/close/i);
    const responseModalElement = screen.getByRole('presentation');

    // When...
    expect(responseModalElement).toHaveClass('is-visible');

    fireEvent.click(modalCloseButtonElement);

    // Then...
    expect(responseModalElement).not.toHaveClass('is-visible');
  });
});
