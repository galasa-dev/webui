/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, act } from '@testing-library/react';
import TokenCard from '@/components/tokens/TokenCard';
import { AuthToken } from '@/generated/galasaapi';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      createdAt: 'Created at',
      expires: 'Expires',
      expired: 'Expired',
      owner: 'Owner',
      nearlyExpiredWarning: 'This token is expiring soon',
    };
    return translations[key] || key;
  },
}));

// Mock DateTimeFormatContext
jest.mock('@/contexts/DateTimeFormatContext', () => ({
  useDateTimeFormat: () => ({
    formatDate: (date: Date) => date.toLocaleDateString('en-GB'),
  }),
}));

describe('TokenCard', () => {
  const mockSelectTokenForDeletion = jest.fn();
  const baseToken: AuthToken = {
    tokenId: 'token-123',
    description: 'Test Token',
    creationTime: '2024-01-01T00:00:00Z',
    owner: {
      loginId: 'testuser',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders token card with basic information', () => {
    const token: AuthToken = {
      ...baseToken,
      expiryTime: '2024-12-31T23:59:59Z',
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText('Test Token')).toBeInTheDocument();
    expect(screen.getByText(/Created at/)).toBeInTheDocument();
    expect(screen.getByText(/Owner testuser/)).toBeInTheDocument();
  });

  it('renders token without expiry time', () => {
    const token: AuthToken = {
      ...baseToken,
      expiryTime: undefined,
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText('Test Token')).toBeInTheDocument();
    expect(screen.queryByText(/Expires/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Expired/)).not.toBeInTheDocument();
  });

  it('shows expired status for expired tokens', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    const token: AuthToken = {
      ...baseToken,
      expiryTime: pastDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText(/Expired/)).toBeInTheDocument();
    expect(screen.queryByText(/Expires/)).not.toBeInTheDocument();
  });

  it('shows expires status for non-expired tokens', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const token: AuthToken = {
      ...baseToken,
      expiryTime: futureDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText(/Expires/)).toBeInTheDocument();
    expect(screen.queryByText(/Expired/)).not.toBeInTheDocument();
  });

  it('shows warning for tokens expiring within warning threshold', () => {
    const nearFutureDate = new Date();
    nearFutureDate.setDate(nearFutureDate.getDate() + 7); // 7 days from now

    const token: AuthToken = {
      ...baseToken,
      expiryTime: nearFutureDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText('This token is expiring soon')).toBeInTheDocument();
  });

  it('does not show warning for tokens expiring beyond warning threshold', () => {
    const farFutureDate = new Date();
    farFutureDate.setDate(farFutureDate.getDate() + 30); // 30 days from now

    const token: AuthToken = {
      ...baseToken,
      expiryTime: farFutureDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.queryByText('This token is expiring soon')).not.toBeInTheDocument();
  });

  it('does not show warning for expired tokens', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    const token: AuthToken = {
      ...baseToken,
      expiryTime: pastDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.queryByText('This token is expiring soon')).not.toBeInTheDocument();
  });

  it('shows warning for token expiring exactly at warning threshold', () => {
    const exactThresholdDate = new Date();
    exactThresholdDate.setDate(exactThresholdDate.getDate() + 14); // Exactly 14 days

    const token: AuthToken = {
      ...baseToken,
      expiryTime: exactThresholdDate.toISOString(),
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    expect(screen.getByText('This token is expiring soon')).toBeInTheDocument();
  });

  it('applies expired styling to expired tokens', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 10);

    const token: AuthToken = {
      ...baseToken,
      expiryTime: pastDate.toISOString(),
    };

    const { container } = render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    const tileElement = container.querySelector('.cardContainerExpired');
    expect(tileElement).toBeInTheDocument();
  });

  it('calls selectTokenForDeletion when clicked', () => {
    const token: AuthToken = {
      ...baseToken,
      expiryTime: '2024-12-31T23:59:59Z',
    };

    render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );

    const tileElement = screen.getByText('Test Token').closest('.cardContainer');
    if (tileElement) {
      act(() => {
        (tileElement as HTMLElement).click();
      });
      expect(mockSelectTokenForDeletion).toHaveBeenCalledWith('token-123');
    }
  });

  it('handles different warning day thresholds correctly', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 25); // 25 days from now

    const token: AuthToken = {
      ...baseToken,
      expiryTime: futureDate.toISOString(),
    };

    // With 14 day threshold, should not show warning
    const { rerender } = render(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={14}
      />
    );
    expect(screen.queryByText('This token is expiring soon')).not.toBeInTheDocument();

    // With 30 day threshold, should show warning
    rerender(
      <TokenCard
        token={token}
        selectTokenForDeletion={mockSelectTokenForDeletion}
        expiryWarningDays={30}
      />
    );
    expect(screen.getByText('This token is expiring soon')).toBeInTheDocument();
  });
});
