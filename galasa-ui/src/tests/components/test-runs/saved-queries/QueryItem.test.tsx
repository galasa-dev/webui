/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { useSavedQueries } from '@/contexts/SavedQueriesContext';
import { useSortable } from '@dnd-kit/sortable';
import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { SavedQueryType } from '@/utils/types/common';
import QueryItem from '@/components/test-runs/saved-queries/QueryItem';
import * as dndKitSortable from '@dnd-kit/sortable';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
  usePathname() {
    return '/';
  },
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: (namespace: string) => (key: string) => {
    return key;
  },
}));

// Mock the context hook
jest.mock('@/contexts/SavedQueriesContext');
const mockUseSavedQueries = useSavedQueries as jest.Mock;

jest.mock('@carbon/icons-react', () => ({
  StarFilled: () => <div data-testid="star-icon" />,
  Draggable: (props: any) => <div data-testid="draggable-icon" {...props} />,
}));

// Mock test data
const defaultQuery: SavedQueryType = {
  createdAt: 'default-query-id',
  title: 'Default Query',
  url: 'default-url',
};

const standardQuery: SavedQueryType = {
  createdAt: 'standard-query-id',
  title: 'Standard Query',
  url: 'standard-url',
};

// Default return value for the useSortable mock
const mockSortableValues: any = {
  attributes: { role: 'button', 'aria-roledescription': 'sortable' },
  listeners: { onKeyDown: jest.fn() },
  setNodeRef: jest.fn(),
  transform: { x: 10, y: 20, scaleX: 1, scaleY: 1 },
  transition: 'transform 250ms ease',
  isDragging: false,
};

describe('QueryItem', () => {
  beforeEach(() => {
    jest.spyOn(dndKitSortable, 'useSortable').mockReturnValue(mockSortableValues);
    mockUseSavedQueries.mockReturnValue({ defaultQuery });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should render the query title and correct link', () => {
    render(<QueryItem query={standardQuery} />);

    const linkElement = screen.getByRole('button', { name: 'Standard Query' });
    expect(linkElement).toBeInTheDocument();
  });

  test('should display a drag handle icon and not the star icon', () => {
    render(<QueryItem query={standardQuery} />);

    expect(screen.getByTestId('draggable-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('star-icon')).not.toBeInTheDocument();
  });

  test('should call useSortable with the correct id and disabled status (false by default)', () => {
    render(<QueryItem query={standardQuery} />);

    expect(dndKitSortable.useSortable).toHaveBeenCalledWith({
      id: standardQuery.createdAt,
      disabled: false,
    });
  });

  describe('Default Item', () => {
    test('should display the star icon and not the drag handle', () => {
      render(<QueryItem query={defaultQuery} />);

      expect(screen.getByTestId('star-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('draggable-icon')).not.toBeInTheDocument();
    });

    test('should be disabled by default for dnd-kit when the disabled prop is passed', () => {
      render(<QueryItem query={defaultQuery} disabled />);

      expect(dndKitSortable.useSortable).toHaveBeenCalledWith({
        id: defaultQuery.createdAt,
        disabled: true,
      });
    });
  });
});
