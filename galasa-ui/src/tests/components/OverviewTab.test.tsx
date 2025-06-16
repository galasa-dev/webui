/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import OverviewTab from '@/components/runs/OverviewTab'; // adjust the path as needed
import { RunMetadata } from '@/utils/interfaces';

// Mock the Carbon Tag component to simplify assertions
jest.mock('@carbon/react', () => ({
  Tag: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="mock-tag">{children}</span>
  ),
}));

const completeMetadata: RunMetadata = {
  runId: "12345678",
  runName: "C123456",
  bundle: 'bundle-xyz',
  testName: 'TestAlpha',
  group: 'GroupA',
  status: "finished",
  result: "Passed",
  submissionId: 'SUB123',
  requestor: 'alice@example.com',
  submitted: '2025-06-10T09:00:00Z',
  startedAt: '2025-06-10T09:05:00Z',
  finishedAt: '2025-06-10T09:15:00Z',
  duration: '10m',
  tags: ['smoke', 'regression'],
};

describe('OverviewTab', () => {
  it('renders all top-level InlineText entries', () => {
    render(<OverviewTab metadata={completeMetadata} />);

    // check each label/value pair
    [
      ['Bundle:', completeMetadata.bundle],
      ['Test:', completeMetadata.testName],
      ['Group:', completeMetadata.group],
      ['Submission ID:', completeMetadata.submissionId],
      ['Requestor:', completeMetadata.requestor],
    ].forEach(([label, value]) => {
      // check the label <p>
      expect(
        screen.getByText(label as string, { selector: 'p' })
      ).toBeInTheDocument();
    
      // check the value wherever it appears
      expect(screen.getByText(value as string)).toBeInTheDocument();
    });
  });

  it('renders the timing fields in the infoContainer', () => {
    render(<OverviewTab metadata={completeMetadata} />);

    ['Submitted:', 'Started:', 'Finished:', 'Duration:'].forEach((label) => {
      expect(
        screen.getByText(label as string, {selector: 'p'})
      ).toBeInTheDocument();
    });
    expect(screen.getByText(completeMetadata.duration)).toBeInTheDocument();
  });

  it('renders each tag when tags array is non-empty', () => {
    render(<OverviewTab metadata={completeMetadata} />);
    // header
    expect(screen.getByRole('heading', { level: 5, name: 'Tags:' })).toBeInTheDocument();
    // tags
    const tagEls = screen.getAllByTestId('mock-tag');
    expect(tagEls).toHaveLength(2);
    expect(tagEls[0]).toHaveTextContent('smoke');
    expect(tagEls[1]).toHaveTextContent('regression');
  });

  it('shows fallback text when tags is empty or missing', () => {
    const noTags: RunMetadata = { ...completeMetadata, tags: [] };
    render(<OverviewTab metadata={noTags} />);
    expect(
      screen.getByText('No tags were associated with this test run.')
    ).toBeInTheDocument();
  });
});
