/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import StatusCheck from "@/components/common/StatusCheck";

// Define types for the icon props
interface IconProps {
  size: number;
  color: string;
}

// Mock the Carbon icons
jest.mock('@carbon/icons-react', () => ({
  CheckmarkFilled: ({ size, color }: IconProps) => (
    <div data-testid="checkmark-icon" data-size={size} data-color={color}>
      CheckmarkFilled
    </div>
  ),
  ErrorOutline: ({ size, color }: IconProps) => (
    <div data-testid="error-icon" data-size={size} data-color={color}>
      ErrorOutline
    </div>
  ),
  Renew: ({ size, color }: IconProps) => (
    <div data-testid="renew-icon" data-size={size} data-color={color}>
      Renew
    </div>
  ),
  Warning: ({ size, color }: IconProps) => (
    <div data-testid="warning-icon" data-size={size} data-color={color}>
      Warning
    </div>
  ),
}));

// Mock the CSS module
jest.mock('@/styles/StatusCheck.module.css', () => ({
  status: 'mocked-status-class',
}));

describe('StatusCheck Component', () => {
  describe('Passed status', () => {
    it('renders correctly for "Passed" status', () => {
      render(<StatusCheck status="Passed" />);
      
      const statusText = screen.getByText('Passed');
      const checkmarkIcon = screen.getByTestId('checkmark-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(checkmarkIcon).toBeInTheDocument();
      expect(checkmarkIcon).toHaveAttribute('data-size', '20');
      expect(checkmarkIcon).toHaveAttribute('data-color', '#24A148');
    });
  });

  describe('Failed status variants', () => {
    it('renders correctly for "Failed" status', () => {
      render(<StatusCheck status="Failed" />);
      
      const statusText = screen.getByText('Failed');
      const errorIcon = screen.getByTestId('error-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('data-size', '20');
      expect(errorIcon).toHaveAttribute('data-color', '#da1e28');
    });

    it('renders correctly for "Hung" status', () => {
      render(<StatusCheck status="Hung" />);
      
      const statusText = screen.getByText('Hung');
      const errorIcon = screen.getByTestId('error-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('data-color', '#da1e28');
    });

    it('renders correctly for "EnvFail" status', () => {
      render(<StatusCheck status="EnvFail" />);
      
      const statusText = screen.getByText('EnvFail');
      const errorIcon = screen.getByTestId('error-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('data-color', '#da1e28');
    });
  });

  describe('Cancelled/Ignored status variants', () => {
    it('renders correctly for "Cancelled" status', () => {
      render(<StatusCheck status="Cancelled" />);
      
      const statusText = screen.getByText('Cancelled');
      const errorIcon = screen.getByTestId('error-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('data-size', '20');
      expect(errorIcon).toHaveAttribute('data-color', '#6f6f6f');
    });

    it('renders correctly for "Ignored" status', () => {
      render(<StatusCheck status="Ignored" />);
      
      const statusText = screen.getByText('Ignored');
      const errorIcon = screen.getByTestId('error-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(errorIcon).toBeInTheDocument();
      expect(errorIcon).toHaveAttribute('data-color', '#6f6f6f');
    });
  });

  describe('Requeued status', () => {
    it('renders correctly for "Requeued" status', () => {
      render(<StatusCheck status="Requeued" />);
      
      const statusText = screen.getByText('Requeued');
      const renewIcon = screen.getByTestId('renew-icon');
      
      expect(statusText).toBeInTheDocument();
      expect(renewIcon).toBeInTheDocument();
      expect(renewIcon).toHaveAttribute('data-size', '20');
      expect(renewIcon).toHaveAttribute('data-color', '#0043ce');
    });
  });

  describe('Unknown status', () => {
    it('renders correctly for unknown status', () => {
      render(<StatusCheck status="SomeUnknownStatus" />);
      
      const unknownText = screen.getByText('Unknown');
      const warningIcon = screen.getByTestId('warning-icon');
      
      expect(unknownText).toBeInTheDocument();
      expect(warningIcon).toBeInTheDocument();
      expect(warningIcon).toHaveAttribute('data-size', '20');
      expect(warningIcon).toHaveAttribute('data-color', '#f1c21b');
    });

    it('renders correctly for empty string status', () => {
      render(<StatusCheck status="" />);
      
      const unknownText = screen.getByText('Unknown');
      const warningIcon = screen.getByTestId('warning-icon');
      
      expect(unknownText).toBeInTheDocument();
      expect(warningIcon).toBeInTheDocument();
    });

    it('renders correctly for null-like status', () => {
      render(<StatusCheck status={null as any} />);
      
      const unknownText = screen.getByText('Unknown');
      const warningIcon = screen.getByTestId('warning-icon');
      
      expect(unknownText).toBeInTheDocument();
      expect(warningIcon).toBeInTheDocument();
    });
  });

  describe('CSS classes', () => {
    it('applies the correct CSS class to all status elements', () => {
      const { container } = render(<StatusCheck status="Passed" />);
      const statusElement: HTMLElement | null = container.querySelector('p');
      
      expect(statusElement).toHaveClass('mocked-status-class');
    });
  });

  describe('Icon properties', () => {
    it('ensures all icons have consistent size property', () => {
      // Test multiple statuses to ensure size consistency
      const statuses: string[] = ['Passed', 'Failed', 'Cancelled', 'Requeued', 'Unknown'];
      
      statuses.forEach((status: string) => {
        const { unmount } = render(<StatusCheck status={status} />);
        const icons = screen.getAllByTestId(/-icon$/);
        
        icons.forEach((icon: HTMLElement) => {
          expect(icon).toHaveAttribute('data-size', '20');
        });
        
        unmount();
      });
    });
  });

  describe('Edge cases', () => {
    it('handles case sensitivity correctly', () => {
      render(<StatusCheck status="passed" />);
      
      // Should render as unknown since it's case sensitive
      const unknownText = screen.getByText('Unknown');
      const warningIcon = screen.getByTestId('warning-icon');
      
      expect(unknownText).toBeInTheDocument();
      expect(warningIcon).toBeInTheDocument();
    });

    it('handles status with extra whitespace', () => {
      render(<StatusCheck status=" Passed " />);
      
      // Should render as unknown since it includes whitespace
      const unknownText = screen.getByText('Unknown');
      const warningIcon = screen.getByTestId('warning-icon');
      
      expect(unknownText).toBeInTheDocument();
      expect(warningIcon).toBeInTheDocument();
    });
  });
});