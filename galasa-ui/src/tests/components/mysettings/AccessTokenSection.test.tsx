/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AccessTokensSection from '@/components/mysettings/AccessTokensSection';
import { AuthTokens } from '@/generated/galasaapi';

// Mock Carbon components
jest.mock('@carbon/react', () => ({
  Loading: () => <div data-testid="loading">Loading...</div>,
  Button: ({ onClick, disabled, children, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => {
    return (key: string, params?: { count?: number }) => {
      switch (key) {
        case 'title':
          return 'Access Tokens';
        case 'descriptionline1':
          return 'An access token is a unique secret key held by a client program so it has permission to use the Galasa service.';
        case 'descriptionline2':
          return 'A token has the same access rights as the user who allocated it.';
        case 'errorTitle':
          return 'Something went wrong!';
        case 'errorDescription':
          return 'Please report the problem to your Galasa Ecosystem administrator.';
        case 'deleteButtontext':
          return `Delete ${params?.count} selected access token${params?.count === 1 ? '' : 's'}`;
        case 'error':
          return 'Failed to fetch tokens from the Galasa API server';
        default:
          return `Translated ${key}`;
      }
    };
  },
}));

// Mock TokenCard to render a button that calls the passed callback
jest.mock('@/components/tokens/TokenCard', () => {
  const MockTokenCard = ({ token, selectTokenForDeletion }: any) => (
    <button
      data-testid={`token-card-${token.tokenId}`}
      onClick={() => selectTokenForDeletion(token.tokenId)}
    >
      TokenCard {token.tokenId}
    </button>
  );

  MockTokenCard.displayName = 'MockTokenCard';
  return MockTokenCard;
});

// Mock TokenRequestModal to display its isDisabled state
jest.mock('@/components/tokens/TokenRequestModal', () => {
  const MockDeleteBtn = ({ isDisabled }: any) => (
    <div data-testid="token-request-modal">
      TokenRequestModal {isDisabled ? 'Disabled' : 'Enabled'}
    </div>
  );

  MockDeleteBtn.displayName = 'MockDeleteBtn';
  return MockDeleteBtn;
});

// Mock TokenDeleteModal to display its presence
jest.mock('@/components/tokens/TokenDeleteModal', () => {
  const MockModal = (props: any) => <div data-testid="token-delete-modal">TokenDeleteModal</div>;

  MockModal.displayName = 'MockModal';
  return MockModal;
});

// --- Tests ---
describe('AccessTokensSection', () => {
  test('displays loading indicator while fetching tokens', () => {
    const pendingPromise = new Promise<AuthTokens | undefined>(() => {});
    render(<AccessTokensSection accessTokensPromise={pendingPromise} isAddBtnVisible={true} />);

    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });

  test('renders tokens and modals correctly after successful fetch', async () => {
    const authTokens: AuthTokens = {
      tokens: [{ tokenId: 'token-1' }, { tokenId: 'token-2' }],
    };
    const resolvedPromise = Promise.resolve(authTokens);
    render(<AccessTokensSection accessTokensPromise={resolvedPromise} isAddBtnVisible={true} />);

    // Wait for the heading (which only renders after loading is finished)
    await waitFor(() => expect(screen.getByText('Access Tokens')).toBeInTheDocument());

    // Check the heading is rendered.
    expect(screen.getByText('Access Tokens')).toBeInTheDocument();

    // Check that a TokenCard is rendered for each token.
    expect(screen.getByTestId('token-card-token-1')).toBeInTheDocument();
    expect(screen.getByTestId('token-card-token-2')).toBeInTheDocument();

    // Since isAddBtnVisible is true and no tokens are selected, TokenRequestModal shows "Enabled".
    expect(screen.getByTestId('token-request-modal')).toHaveTextContent('Enabled');

    // The delete button should initially be disabled (0 tokens selected).
    const deleteButton = screen.getByRole('button', {
      name: /Delete 0 selected access tokens/i,
    });
    expect(deleteButton).toBeDisabled();
  });

  test('renders error page when fetching tokens fails', async () => {
    const rejectedPromise = Promise.reject(new Error('Fetch error'));
    render(<AccessTokensSection accessTokensPromise={rejectedPromise} isAddBtnVisible={false} />);

    // Wait for the error page to be rendered.
    await waitFor(() => expect(screen.getByText('Something went wrong!')).toBeInTheDocument());
  });

  test('enables delete button and opens delete modal when token is selected', async () => {
    const authTokens: AuthTokens = {
      tokens: [{ tokenId: 'token-1' }],
    };
    const resolvedPromise = Promise.resolve(authTokens);
    render(<AccessTokensSection accessTokensPromise={resolvedPromise} isAddBtnVisible={true} />);

    // Wait for the token to render.
    await waitFor(() => expect(screen.getByTestId('token-card-token-1')).toBeInTheDocument());

    // Initially, the delete button should be disabled.
    const deleteButtonInitial = screen.getByRole('button', {
      name: /Delete 0 selected access tokens/i,
    });
    expect(deleteButtonInitial).toBeDisabled();

    // Click the token card to select it.
    fireEvent.click(screen.getByTestId('token-card-token-1'));

    // After selection, the delete button text updates and becomes enabled.
    const deleteButtonSelected = await screen.findByRole('button', {
      name: /Delete 1 selected access token(s)?/i,
    });

    expect(deleteButtonSelected).toBeEnabled();

    // Click the delete button to open the delete modal.
    fireEvent.click(deleteButtonSelected);

    // The delete modal should now be visible.
    expect(screen.getByTestId('token-delete-modal')).toBeInTheDocument();
  });

  test('updates TokenRequestModal isDisabled prop based on token selection', async () => {
    const authTokens: AuthTokens = {
      tokens: [{ tokenId: 'token-1' }],
    };
    const resolvedPromise = Promise.resolve(authTokens);
    render(<AccessTokensSection accessTokensPromise={resolvedPromise} isAddBtnVisible={true} />);

    // Wait for the token to appear.
    await waitFor(() => expect(screen.getByTestId('token-card-token-1')).toBeInTheDocument());

    // Initially, no token is selected so TokenRequestModal should show "Enabled".
    expect(screen.getByTestId('token-request-modal')).toHaveTextContent('Enabled');

    // Click on the token to select it.
    fireEvent.click(screen.getByTestId('token-card-token-1'));

    // Now, TokenRequestModal should re-render and display "Disabled".
    await waitFor(() =>
      expect(screen.getByTestId('token-request-modal')).toHaveTextContent('Disabled')
    );
  });
});
