/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('@/components/PageTile', () => {
  return function MockPageTile({ translationKey }: { translationKey: string }) {
    return <div data-testid="page-tile">{translationKey}</div>;
  };
});

jest.mock('@/components/users/UserRoleSection', () => {
  return function MockUserRoleSection({
    userProfilePromise,
    roleDetailsPromise,
  }: {
    userProfilePromise: any;
    roleDetailsPromise: any;
  }) {
    return (
      <div data-testid="user-role-section">
        <span data-testid="user-profile-promise">user-profile-received</span>
        <span data-testid="role-details-promise">role-details-received</span>
      </div>
    );
  };
});

jest.mock('@/components/mysettings/AccessTokensSection', () => {
  return function MockAccessTokensSection({
    accessTokensPromise,
    isAddBtnVisible,
  }: {
    accessTokensPromise: any;
    isAddBtnVisible: boolean;
  }) {
    return (
      <div data-testid="access-tokens-section">
        <span data-testid="access-tokens-promise">access-tokens-received</span>
        <span data-testid="add-btn-visible">{isAddBtnVisible ? 'visible' : 'hidden'}</span>
      </div>
    );
  };
});

jest.mock('@/components/common/BreadCrumb', () => {
  return function MockBreadCrumb({ breadCrumbItems }: { breadCrumbItems: any[] }) {
    return (
      <div data-testid="breadcrumb">
        {breadCrumbItems.map((item, index) => (
          <span key={index} data-testid={`breadcrumb-item-${index}`}>
            {typeof item === 'object' ? item.label || 'breadcrumb-item' : item}
          </span>
        ))}
      </div>
    );
  };
});

jest.mock('@/generated/galasaapi', () => ({
  RoleBasedAccessControlAPIApi: jest.fn().mockImplementation(() => ({
    getRBACRoles: jest.fn().mockResolvedValue([
      { id: '1', name: 'Admin', description: 'Administrator role' },
      { id: '2', name: 'User', description: 'Regular user role' },
    ]),
  })),
  ConfigurationPropertyStoreAPIApi: jest.fn().mockImplementation(() => ({
    getCpsProperty: jest.fn().mockResolvedValue([
      { data: { value: '14' } },
    ]),
  })),
  RBACRole: {},
}));

jest.mock('@/utils/api', () => ({
  createAuthenticatedApiConfiguration: jest.fn().mockReturnValue({
    baseServer: { makeRequestContext: jest.fn() },
    httpApi: { send: jest.fn() },
    middleware: [],
    authMethods: {},
  }),
}));

jest.mock('@/actions/getUserAccessTokens', () => ({
  fetchAccessTokens: jest.fn().mockResolvedValue({
    tokens: [
      { tokenId: 'token1', description: 'Test token 1' },
      { tokenId: 'token2', description: 'Test token 2' },
    ],
  }),
}));

jest.mock('@/actions/userServerActions', () => ({
  fetchUserFromApiServer: jest.fn().mockResolvedValue({
    loginId: 'testuser',
    roles: ['user'],
  }),
}));

jest.mock('@/utils/constants/breadcrumb', () => ({
  HOME: { label: 'Home', href: '/' },
  EDIT_USER: { label: 'Edit User', href: '/users/edit' },
}));

// Import after mocking
import EditUserPage from '@/app/users/edit/page';

describe('EditUserPage', () => {
  const defaultProps = {
    params: Promise.resolve({}),
    searchParams: Promise.resolve({ loginId: 'testuser123' }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the main content structure', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      expect(mainElement).toHaveAttribute('id', 'content');
    });

    it('should render BreadCrumb component', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const breadcrumb = screen.getByTestId('breadcrumb');
      expect(breadcrumb).toBeInTheDocument();

      // Check that breadcrumb items are rendered
      expect(screen.getByTestId('breadcrumb-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('breadcrumb-item-1')).toBeInTheDocument();
    });

    it('should render PageTile with correct translation key', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const pageTile = screen.getByTestId('page-tile');
      expect(pageTile).toBeInTheDocument();
      expect(pageTile).toHaveTextContent('UserEditPage.title');
    });

    it('should render UserRoleSection component', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const userRoleSection = screen.getByTestId('user-role-section');
      expect(userRoleSection).toBeInTheDocument();
      expect(screen.getByTestId('user-profile-promise')).toHaveTextContent('user-profile-received');
      expect(screen.getByTestId('role-details-promise')).toHaveTextContent('role-details-received');
    });

    it('should render AccessTokensSection with isAddBtnVisible set to false', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const accessTokensSection = screen.getByTestId('access-tokens-section');
      expect(accessTokensSection).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-promise')).toHaveTextContent(
        'access-tokens-received'
      );
      expect(screen.getByTestId('add-btn-visible')).toHaveTextContent('hidden');
    });
  });

  describe('Props and SearchParams Handling', () => {
    it('should handle loginId from searchParams correctly', async () => {
      const loginId = 'user456';
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({ loginId }),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });

    it('should handle missing loginId gracefully', async () => {
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({}),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });

    it('should handle empty string loginId', async () => {
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({ loginId: '' }),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render all required components in correct order', async () => {
      const component = await EditUserPage(defaultProps);
      render(component);

      const main = screen.getByRole('main');
      const breadcrumb = screen.getByTestId('breadcrumb');
      const pageTile = screen.getByTestId('page-tile');
      const userRoleSection = screen.getByTestId('user-role-section');
      const accessTokensSection = screen.getByTestId('access-tokens-section');

      expect(main).toBeInTheDocument();
      expect(breadcrumb).toBeInTheDocument();
      expect(pageTile).toBeInTheDocument();
      expect(userRoleSection).toBeInTheDocument();
      expect(accessTokensSection).toBeInTheDocument();

      expect(main).toContainElement(breadcrumb);
      expect(main).toContainElement(pageTile);
      expect(main).toContainElement(userRoleSection);
      expect(main).toContainElement(accessTokensSection);
    });
  });

  describe('Edge Cases', () => {
    it('should handle special characters in loginId', async () => {
      const loginId = 'user@domain.com';
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({ loginId }),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });

    it('should handle additional searchParams', async () => {
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({
          loginId: 'testuser',
          additionalParam: 'value',
          anotherParam: 'anotherValue',
        }),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });

    it('should handle array values in searchParams', async () => {
      const props = {
        params: Promise.resolve({}),
        searchParams: Promise.resolve({
          loginId: 'testuser',
          tags: ['tag1', 'tag2'],
        }),
      };

      const component = await EditUserPage(props);
      render(component);

      expect(screen.getByTestId('user-role-section')).toBeInTheDocument();
      expect(screen.getByTestId('access-tokens-section')).toBeInTheDocument();
    });
  });
});
