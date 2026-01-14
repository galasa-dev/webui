/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RenderTags from '@/components/test-runs/test-run-details/RenderTags';
import { textToHexColour } from '@/utils/functions/textToHexColour';

// Mock the textToHexColour function.
jest.mock('@/utils/functions/textToHexColour');

// Mock Carbon React components.
jest.mock('@carbon/react', () => ({
  Tag: ({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) => (
    <span data-testid="mock-tag" style={style}>
      {children}
    </span>
  ),
  DismissibleTag: ({
    text,
    onClose,
    style,
    size,
    title,
  }: {
    text: string;
    onClose: () => void;
    style: React.CSSProperties;
    size: string;
    title: string;
  }) => (
    <span data-testid="mock-dismissible-tag" data-size={size} title={title} style={style}>
      {text}
      <button data-testid="dismiss-button" onClick={onClose}>
        ×
      </button>
    </span>
  ),
}));

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      noTags: 'No tags were associated with this test run.',
      removeTag: 'Remove tag',
    };
    return translations[key] || key;
  },
}));

const mockTextToHexColour = textToHexColour as jest.MockedFunction<typeof textToHexColour>;

describe('RenderTags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    mockTextToHexColour.mockImplementation((text: string) => {
      // Return different colors based on text for testing
      if (text === 'smoke') return ['#FF6B6B', '#FFFFFF'];
      if (text === 'regression') return ['#4ECDC4', '#000000'];
      if (text === 'critical') return ['#45B7D1', '#FFFFFF'];
      return ['#000000', '#FFFFFF'];
    });
  });

  describe('Non-dismissible tags', () => {
    it('should display fallback message when tags array is empty', () => {
      render(<RenderTags tags={[]} dismissible={false} size="md" />);
      expect(screen.getByText('No tags were associated with this test run.')).toBeInTheDocument();
    });

    it('should render single tag correctly', () => {
      const tags = ['production'];
      mockTextToHexColour.mockReturnValue(['#FF0000', '#FFFFFF']);

      render(<RenderTags tags={tags} dismissible={false} size="md" />);

      const tagElements = screen.getAllByTestId('mock-tag');
      expect(tagElements).toHaveLength(1);
      expect(tagElements[0]).toHaveTextContent('production');
    });

    it('should render regular tags when dismissible is false', () => {
      const tags = ['smoke', 'regression'];
      render(<RenderTags tags={tags} dismissible={false} size="md" />);

      const tagElements = screen.getAllByTestId('mock-tag');
      expect(tagElements).toHaveLength(2);
      expect(tagElements[0]).toHaveTextContent('smoke');
      expect(tagElements[1]).toHaveTextContent('regression');
    });

    it('should apply correct colors to non-dismissible tags', () => {
      const tags = ['smoke', 'regression'];
      render(<RenderTags tags={tags} dismissible={false} size="md" />);

      const tagElements = screen.getAllByTestId('mock-tag');
      expect(tagElements[0]).toHaveStyle({
        backgroundColor: '#FF6B6B',
        color: '#FFFFFF',
      });
      expect(tagElements[1]).toHaveStyle({
        backgroundColor: '#4ECDC4',
        color: '#000000',
      });
    });

    it('should handle tags with special characters', () => {
      const tags = ['tag-with-dash', 'tag_with_underscore', 'tag.with.dot'];
      render(<RenderTags tags={tags} dismissible={false} size="md" />);

      const tagElements = screen.getAllByTestId('mock-tag');
      expect(tagElements).toHaveLength(3);
      expect(tagElements[0]).toHaveTextContent('tag-with-dash');
      expect(tagElements[1]).toHaveTextContent('tag_with_underscore');
      expect(tagElements[2]).toHaveTextContent('tag.with.dot');
    });
  });

  describe('Dismissible tags', () => {
    it('should render dismissible tags when dismissible is true', () => {
      const tags = ['smoke', 'regression'];
      render(<RenderTags tags={tags} dismissible={true} size="lg" />);

      const tagElements = screen.getAllByTestId('mock-dismissible-tag');
      expect(tagElements).toHaveLength(2);
      expect(tagElements[0]).toHaveTextContent('smoke');
      expect(tagElements[1]).toHaveTextContent('regression');
    });

    it('should apply correct colors to dismissible tags', () => {
      const tags = ['smoke', 'regression'];
      render(<RenderTags tags={tags} dismissible={true} size="lg" />);

      const tagElements = screen.getAllByTestId('mock-dismissible-tag');
      expect(tagElements[0]).toHaveStyle({
        backgroundColor: '#FF6B6B',
        color: '#FFFFFF',
      });
      expect(tagElements[1]).toHaveStyle({
        backgroundColor: '#4ECDC4',
        color: '#000000',
      });
    });

    it('should call onTagRemove when dismiss button is clicked', () => {
      const mockOnTagRemove = jest.fn();
      const tags = ['smoke', 'regression'];

      render(<RenderTags tags={tags} dismissible={true} size="lg" onTagRemove={mockOnTagRemove} />);

      const dismissButtons = screen.getAllByTestId('dismiss-button');
      fireEvent.click(dismissButtons[0]);

      expect(mockOnTagRemove).toHaveBeenCalledTimes(1);
      expect(mockOnTagRemove).toHaveBeenCalledWith('smoke');
    });

    it('should pass correct size prop to dismissible tags', () => {
      const tags = ['smoke'];
      render(<RenderTags tags={tags} dismissible={true} size="sm" />);

      const tagElement = screen.getByTestId('mock-dismissible-tag');
      expect(tagElement).toHaveAttribute('data-size', 'sm');
    });

    it('should have correct title attribute for dismissible tags', () => {
      const tags = ['smoke'];
      render(<RenderTags tags={tags} dismissible={true} size="lg" />);

      const tagElement = screen.getByTestId('mock-dismissible-tag');
      expect(tagElement).toHaveAttribute('title', 'Remove tag');
    });
  });

  describe('Tag sizes', () => {
    it('should render tags with small size', () => {
      const tags = ['smoke'];
      render(<RenderTags tags={tags} dismissible={true} size="sm" />);

      const tagElement = screen.getByTestId('mock-dismissible-tag');
      expect(tagElement).toHaveAttribute('data-size', 'sm');
    });

    it('should render tags with medium size', () => {
      const tags = ['smoke'];
      render(<RenderTags tags={tags} dismissible={false} size="md" />);

      // For non-dismissible tags, size is passed but not visible in our mock
      expect(screen.getByTestId('mock-tag')).toBeInTheDocument();
    });

    it('should render tags with large size', () => {
      const tags = ['smoke'];
      render(<RenderTags tags={tags} dismissible={true} size="lg" />);

      const tagElement = screen.getByTestId('mock-dismissible-tag');
      expect(tagElement).toHaveAttribute('data-size', 'lg');
    });
  });
});
