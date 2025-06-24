/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Interfaces related to authentication tokens and token management
 */

export interface TokenDetails {
  clientId: string;
  refreshToken: string;
  tokenDescription: string;
}

export interface TokenDeleteModalProps {
  accessToken: {
    tokenId: string;
    description: string;
  };
  onCancel: () => void;
  onDelete: (tokenId: string) => void;
  isVisible: boolean;
}

export interface TokenResponseModalProps {
  refreshToken: string;
  clientId: string;
  onLoad: () => void;
}

export interface AccessTokensSectionProps {
  accessTokensPromise: Promise<any>;
  isAddBtnVisible: boolean;
}
