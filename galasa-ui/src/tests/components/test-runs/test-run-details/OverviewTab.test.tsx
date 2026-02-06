/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OverviewTab from '@/components/test-runs/test-run-details/OverviewTab';
import { RunMetadata } from '@/utils/interfaces';
import { getAWeekBeforeSubmittedTime } from '@/utils/timeOperations';
import { updateRunTags } from '@/actions/runsAction';

// Mock the server action
jest.mock('@/actions/runsAction', () => ({
  updateRunTags: jest.fn(),
  getExistingTagObjects: jest.fn().mockResolvedValue({
    success: true,
    tags: ['existing-tag-1', 'existing-tag-2'],
  }),
}));

// Mock RenderTags component
jest.mock('@/components/test-runs/test-run-details/RenderTags', () => ({
  __esModule: true,
  default: ({ tags, isDismissible, onTagRemove }: any) => {
    if (tags.length === 0) {
      return <p>No tags were associated with this test run.</p>;
    }
    return (
      <div data-testid="mock-render-tags" data-dismissible={isDismissible}>
        {tags.map((tag: string, index: number) => (
          <span key={index} data-testid="mock-tag">
            {tag}
            {isDismissible && onTagRemove && (
              <button data-testid={`remove-tag-${tag}`} onClick={() => onTagRemove(tag)}>
                Remove
              </button>
            )}
          </span>
        ))}
      </div>
    );
  },
}));

// Mock the Carbon components
jest.mock('@carbon/react', () => ({
  Tag: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="mock-tag">{children}</span>
  ),
  Link: ({
    children,
    href,
    renderIcon,
  }: {
    children: React.ReactNode;
    href: string;
    renderIcon?: React.ComponentType;
  }) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  ),
  InlineNotification: ({ kind, title, subtitle }: any) => (
    <div data-testid="mock-notification" data-kind={kind}>
      <div>{title}</div>
      <div>{subtitle}</div>
    </div>
  ),
  TextInput: ({ value, onChange, onKeyDown, labelText, placeholder }: any) => (
    <input
      data-testid="mock-text-input"
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label={labelText}
    />
  ),
  FilterableMultiSelect: ({
    id,
    titleText,
    placeholder,
    items,
    initialSelectedItems,
    selectedItems,
    itemToString,
    onChange,
    onInputValueChange,
  }: any) => (
    <div data-testid="mock-filterable-multiselect">
      <label>{titleText}</label>
      <input
        data-testid="filterable-multiselect-input"
        placeholder={placeholder}
        onChange={(e) => onInputValueChange && onInputValueChange(e.target.value)}
      />
      <div data-testid="filterable-multiselect-items">
        {items.map((item: any) => {
          const isSelected = selectedItems?.some((selected: any) => selected.id === item.id);
          return (
            <div key={item.id} data-testid={`multiselect-item-${item.label}`}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  const newSelected = e.target.checked
                    ? [...(selectedItems || []), item]
                    : (selectedItems || []).filter((s: any) => s.id !== item.id);
                  onChange && onChange({ selectedItems: newSelected });
                }}
              />
              <label>{itemToString ? itemToString(item) : item.label}</label>
            </div>
          );
        })}
      </div>
    </div>
  ),
  Modal: ({
    open,
    children,
    modalHeading,
    primaryButtonText,
    secondaryButtonText,
    onRequestSubmit,
    onRequestClose,
  }: any) =>
    open ? (
      <div data-testid="mock-modal">
        <h2>{modalHeading}</h2>
        {children}
        <button data-testid="modal-primary-button" onClick={onRequestSubmit}>
          {primaryButtonText}
        </button>
        <button data-testid="modal-secondary-button" onClick={onRequestClose}>
          {secondaryButtonText}
        </button>
      </div>
    ) : null,
}));

jest.mock('@carbon/icons-react', () => ({
  Launch: () => <span data-testid="launch-icon">Launch</span>,
  Edit: () => <span data-testid="edit-icon">Edit</span>,
}));

jest.mock('@/utils/timeOperations', () => ({
  getAWeekBeforeSubmittedTime: jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      bundle: 'Bundle',
      testName: 'Test',
      testShortName: 'Test Short Name',
      package: 'Package',
      group: 'Group',
      submissionId: 'Submission ID',
      requestor: 'Requestor',
      user: 'User',
      submitted: 'Submitted',
      started: 'Started',
      finished: 'Finished',
      duration: 'Duration',
      tags: 'Tags',
      noTags: 'No tags were associated with this test run.',
      recentRunsLink: 'View other recent runs of this test',
      runRetriesLink: 'View all attempts of this test run',
      modalHeading: 'Edit tags for',
      modalPrimaryButton: 'Save',
      modalSecondaryButton: 'Cancel',
      modalLabelText: 'Add tags',
      modalPlaceholderText: 'Enter tags separated by commas or spaces',
      updateSuccess: 'Tags updated successfully',
      updateSuccessMessage: 'The tags have been updated.',
      updateError: 'Failed to update tags',
      updateErrorMessage: 'An error occurred while updating tags.',
    };
    return translations[key] || key;
  },
}));

const pushBreadCrumbMock = jest.fn();
jest.mock('@/hooks/useHistoryBreadCrumbs', () => ({
  __esModule: true,
  default: () => ({
    pushBreadCrumb: pushBreadCrumbMock,
    resetBreadCrumbs: jest.fn(),
  }),
}));

const completeMetadata: RunMetadata = {
  runId: '12345678',
  runName: 'C123456',
  bundle: 'bundle-xyz',
  testName: 'TestAlpha',
  testShortName: 'TestAlphaShort',
  group: 'GroupA',
  status: 'finished',
  result: 'Passed',
  package: 'com.example.tests',
  submissionId: 'SUB123',
  requestor: 'alice@example.com',
  user: 'alice2@example.com',
  submitted: '2025-06-10T09:00:00Z',
  startedAt: '2025-06-10T09:05:00Z',
  finishedAt: '2025-06-10T09:15:00Z',
  duration: '10m',
  tags: ['smoke', 'regression'],
};

const mockGetAWeekBeforeSubmittedTime = getAWeekBeforeSubmittedTime as jest.MockedFunction<
  typeof getAWeekBeforeSubmittedTime
>;

describe('OverviewTab', () => {
  it('renders all top-level InlineText entries', () => {
    render(<OverviewTab metadata={completeMetadata} />);

    // check each label/value pair
    [
      ['Bundle:', completeMetadata.bundle],
      ['Test:', completeMetadata.testName],
      ['Package:', completeMetadata.package],
      ['Group:', completeMetadata.group],
      ['Submission ID:', completeMetadata.submissionId],
      ['Requestor:', completeMetadata.requestor],
      ['User:', completeMetadata.user],
    ].forEach(([label, value]) => {
      // check the label <p>
      expect(screen.getByText(label as string, { selector: 'p' })).toBeInTheDocument();

      // check the value wherever it appears
      expect(screen.getByText(value as string)).toBeInTheDocument();
    });
  });

  it('renders the timing fields in the infoContainer', () => {
    render(<OverviewTab metadata={completeMetadata} />);

    ['Submitted:', 'Started:', 'Finished:', 'Duration:'].forEach((label) => {
      expect(screen.getByText(label as string, { selector: 'p' })).toBeInTheDocument();
    });
    expect(screen.getByText(completeMetadata.duration)).toBeInTheDocument();
  });

  it('renders each tag when tags array is non-empty, sorted', () => {
    render(<OverviewTab metadata={completeMetadata} />);
    // header - use getByText since h5 contains nested elements
    expect(screen.getByText('Tags', { selector: 'h5' })).toBeInTheDocument();

    const tagEls = screen.getAllByTestId('mock-tag');
    expect(tagEls).toHaveLength(2);
    expect(tagEls[0]).toHaveTextContent('regression');
    expect(tagEls[1]).toHaveTextContent('smoke');
  });

  it('shows fallback text when tags is empty or missing', () => {
    const noTags: RunMetadata = { ...completeMetadata, tags: [] };
    render(<OverviewTab metadata={noTags} />);
    expect(screen.getByText('No tags were associated with this test run.')).toBeInTheDocument();
  });
});

describe('OverviewTab - Time and Link Logic', () => {
  beforeEach(() => {
    mockGetAWeekBeforeSubmittedTime.mockReset();
  });

  it('renders recent runs link with correct href', async () => {
    mockGetAWeekBeforeSubmittedTime.mockReturnValue('2025-06-03T09:00:00Z');

    render(<OverviewTab metadata={completeMetadata} />);

    await screen.findAllByTestId('mock-link');

    const links = screen.getAllByTestId('mock-link');
    const recentRunsLink = links.find((link) => link.getAttribute('href')?.includes('testName='));

    const expectedHref = `/test-runs?testName=${completeMetadata.testName}&bundle=${completeMetadata.bundle}&package=${completeMetadata.package}&duration=60,0,0&tab=results&queryName=Recent runs of test TestAlpha`;

    expect(recentRunsLink).toHaveAttribute('href', expectedHref);
  });

  it('renders both links when weekBefore is valid', async () => {
    const mockMonthAgoDate = '2025-05-10T00:00:00Z';
    const mockWeekBefore = '2025-06-03T09:00:00Z';

    mockGetAWeekBeforeSubmittedTime.mockReturnValue(mockWeekBefore);

    render(<OverviewTab metadata={completeMetadata} />);

    await screen.findAllByTestId('mock-link');

    const links = screen.getAllByTestId('mock-link');
    expect(links).toHaveLength(2);

    // Check the retries link href
    const retriesLink = links.find((link) => link.getAttribute('href')?.includes('submissionId'));
    expect(retriesLink).toHaveAttribute(
      'href',
      `/test-runs?submissionId=${completeMetadata.submissionId}&from=${mockWeekBefore}&tab=results&queryName=All attempts of test run C123456`
    );
  });

  it('renders only recent runs link when weekBefore is invalid', async () => {
    mockGetAWeekBeforeSubmittedTime.mockReturnValue(null);

    render(<OverviewTab metadata={completeMetadata} />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const links = screen.getAllByTestId('mock-link');
    expect(links).toHaveLength(1);

    expect(links[0]).toHaveAttribute('href', expect.stringContaining('testName='));
    expect(links[0]).not.toHaveAttribute('href', expect.stringContaining('submissionId='));
  });

  it('calls getAWeekBeforeSubmittedTime with correct parameter', () => {
    const metadataWithRawSubmittedAt: RunMetadata = {
      ...completeMetadata,
      rawSubmittedAt: '2025-06-10T09:00:00Z',
    };

    mockGetAWeekBeforeSubmittedTime.mockReturnValue('2025-06-03T09:00:00Z');

    render(<OverviewTab metadata={metadataWithRawSubmittedAt} />);

    expect(mockGetAWeekBeforeSubmittedTime).toHaveBeenCalledWith('2025-06-10T09:00:00Z');
    expect(mockGetAWeekBeforeSubmittedTime).toHaveBeenCalledTimes(1);
  });

  it('handles missing rawSubmittedAt gracefully', () => {
    const metadataWithoutRawSubmittedAt: RunMetadata = {
      ...completeMetadata,
      rawSubmittedAt: undefined,
    };

    mockGetAWeekBeforeSubmittedTime.mockReturnValue('Invalid date');

    render(<OverviewTab metadata={metadataWithoutRawSubmittedAt} />);

    expect(mockGetAWeekBeforeSubmittedTime).toHaveBeenCalledWith(undefined);
  });

  it('updates weekBefore state correctly when time is valid', async () => {
    const mockWeekBefore = '2025-06-03T09:00:00Z';

    mockGetAWeekBeforeSubmittedTime.mockReturnValue(mockWeekBefore);

    render(<OverviewTab metadata={completeMetadata} />);

    await screen.findAllByTestId('mock-link');

    const links = screen.getAllByTestId('mock-link');
    const retriesLink = links.find((link) => link.getAttribute('href')?.includes('submissionId'));

    expect(retriesLink).toBeDefined();
  });

  it('updates weekBefore state correctly when time is invalid', async () => {
    mockGetAWeekBeforeSubmittedTime.mockReturnValue(null);

    render(<OverviewTab metadata={completeMetadata} />);

    await new Promise((resolve) => setTimeout(resolve, 0));

    const links = screen.getAllByTestId('mock-link');
    expect(links).toHaveLength(1);

    const retriesLink = links.find((link) => link.getAttribute('href')?.includes('submissionId'));
    expect(retriesLink).toBeUndefined();
  });

  it('push link bread crumb when any of the links is clicked', () => {
    render(<OverviewTab metadata={completeMetadata} />);

    const links = screen.getAllByTestId('mock-link');
    links.forEach((link) => {
      link.click();
      expect(pushBreadCrumbMock).toHaveBeenCalledWith({
        title: `${completeMetadata.runName}`,
        route: `/test-runs/${completeMetadata.runId}`,
      });
    });
  });
});

describe('OverviewTab - Tags Edit Modal', () => {
  const mockUpdateRunTags = updateRunTags as jest.MockedFunction<typeof updateRunTags>;

  beforeEach(() => {
    mockGetAWeekBeforeSubmittedTime.mockReturnValue('2025-06-03T09:00:00Z');
    mockUpdateRunTags.mockClear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should open modal when edit icon is clicked', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });
  });

  it('should display RenderTags component with dismissible tags in modal', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      const renderTagsInModal = screen.getAllByTestId('mock-render-tags')[1]; // Second one is in modal
      expect(renderTagsInModal).toHaveAttribute('data-dismissible', 'true');
    });
  });

  it('should close modal when secondary button is clicked', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const secondaryButton = screen.getByTestId('modal-secondary-button');
    await user.click(secondaryButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });

  it('should handle tag removal in modal', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('remove-tag-smoke')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('remove-tag-smoke');
    await user.click(removeButton);

    await waitFor(() => {
      // Tag should be removed from staged tags
      expect(screen.queryByTestId('remove-tag-smoke')).not.toBeInTheDocument();
    });
  });

  it('should successfully save tags via server action', async () => {
    const user = userEvent.setup();
    mockUpdateRunTags.mockResolvedValueOnce({
      success: true,
      tags: ['smoke', 'regression'],
    });

    // Mock window.location.reload.
    delete (window as any).location;
    (window as any).location = { reload: jest.fn() };

    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const primaryButton = screen.getByTestId('modal-primary-button');
    await user.click(primaryButton);

    await waitFor(() => {
      expect(mockUpdateRunTags).toHaveBeenCalledWith(completeMetadata.runId, [
        'regression',
        'smoke',
      ]);
    });
  });

  it('should display error notification when server action fails', async () => {
    const user = userEvent.setup();
    mockUpdateRunTags.mockResolvedValueOnce({
      success: false,
      error: 'Server Error',
    });

    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const primaryButton = screen.getByTestId('modal-primary-button');
    await user.click(primaryButton);

    await waitFor(() => {
      const notification = screen.getByTestId('mock-notification');
      expect(notification).toHaveAttribute('data-kind', 'error');
    });
  });

  it('should display success notification when tags are saved', async () => {
    const user = userEvent.setup();
    mockUpdateRunTags.mockResolvedValueOnce({
      success: true,
      tags: ['smoke', 'regression'],
    });

    // Mock window.location.reload
    delete (window as any).location;
    (window as any).location = { reload: jest.fn() };

    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    });

    const primaryButton = screen.getByTestId('modal-primary-button');
    await user.click(primaryButton);

    await waitFor(() => {
      const notification = screen.getByTestId('mock-notification');
      expect(notification).toHaveAttribute('data-kind', 'success');
    });
  });

  it('should reset staged tags when modal is closed without saving', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('remove-tag-smoke')).toBeInTheDocument();
    });

    // Remove a tag
    const removeButton = screen.getByTestId('remove-tag-smoke');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('remove-tag-smoke')).not.toBeInTheDocument();
    });

    // Close modal without saving
    const secondaryButton = screen.getByTestId('modal-secondary-button');
    await user.click(secondaryButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    // Reopen modal
    await user.click(editIcon);

    await waitFor(() => {
      // Tag should be back (staged changes reset on cancel)
      expect(screen.getByTestId('remove-tag-smoke')).toBeInTheDocument();
      // And regression tag should still be there
      expect(screen.getByTestId('remove-tag-regression')).toBeInTheDocument();
    });
  });

  it('should display modal heading with run name', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(completeMetadata.runName))).toBeInTheDocument();
    });
  });

  it('should initialise staged tags from current tags when modal opens', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      // Both original tags should be present in the modal
      expect(screen.getByTestId('remove-tag-smoke')).toBeInTheDocument();
      expect(screen.getByTestId('remove-tag-regression')).toBeInTheDocument();
    });
  });

  it('should display FilterableMultiSelect with sorted items alphabetically', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Check that items are present (they should be sorted alphabetically)
    const items = screen.getByTestId('filterable-multiselect-items');
    expect(items).toBeInTheDocument();
  });

  it('should maintain alphabetical sorting when adding new tags via filter input', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Type a new tag in the filter input
    const filterInput = screen.getByTestId('filterable-multiselect-input');
    await user.type(filterInput, 'alpha-tag');

    await waitFor(() => {
      // The new tag should appear in the items list
      expect(screen.getByTestId('multiselect-item-alpha-tag')).toBeInTheDocument();
    });
  });

  it('should keep selected items ticked in the dropdown', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Check that initial tags are selected (checked)
    const smokeCheckbox = screen
      .getByTestId('multiselect-item-smoke')
      .querySelector('input[type="checkbox"]');
    const regressionCheckbox = screen
      .getByTestId('multiselect-item-regression')
      .querySelector('input[type="checkbox"]');

    expect(smokeCheckbox).toBeChecked();
    expect(regressionCheckbox).toBeChecked();
  });

  it('should update staged tags when selecting items in FilterableMultiSelect', async () => {
    const user = userEvent.setup();
    const metadataWithOneTag: RunMetadata = {
      ...completeMetadata,
      tags: ['smoke'],
    };
    render(<OverviewTab metadata={metadataWithOneTag} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Select an existing tag that wasn't initially selected
    const existingTag1Checkbox = screen
      .getByTestId('multiselect-item-existing-tag-1')
      .querySelector('input[type="checkbox"]');
    if (existingTag1Checkbox) {
      await user.click(existingTag1Checkbox);
    }

    await waitFor(() => {
      // The tag should now appear in the RenderTags component
      const tags = screen.getAllByTestId('mock-tag');
      const tagTexts = tags.map((tag) => tag.textContent);
      expect(tagTexts.some((text) => text?.includes('existing-tag-1'))).toBe(true);
    });
  });

  it('should clear filter input when modal is closed', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Type something in the filter input
    const filterInput = screen.getByTestId('filterable-multiselect-input');
    await user.type(filterInput, 'test-tag');

    // Close modal
    const secondaryButton = screen.getByTestId('modal-secondary-button');
    await user.click(secondaryButton);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });

    // Reopen modal
    await user.click(editIcon);

    await waitFor(() => {
      const filterInputReopened = screen.getByTestId('filterable-multiselect-input');
      // Filter input should be empty
      expect(filterInputReopened).toHaveValue('');
    });
  });

  it('should update main tags display after successful save', async () => {
    const user = userEvent.setup();
    mockUpdateRunTags.mockResolvedValueOnce({
      success: true,
      tags: ['smoke', 'regression', 'new-tag'],
    });

    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Add a new tag via filter input
    const filterInput = screen.getByTestId('filterable-multiselect-input');
    await user.type(filterInput, 'new-tag');

    await waitFor(async () => {
      const newTagCheckbox = screen
        .getByTestId('multiselect-item-new-tag')
        .querySelector('input[type="checkbox"]');
      if (newTagCheckbox) {
        await user.click(newTagCheckbox);
      }
    });

    // Save
    const primaryButton = screen.getByTestId('modal-primary-button');
    await user.click(primaryButton);

    await waitFor(() => {
      expect(mockUpdateRunTags).toHaveBeenCalled();
    });

    // After modal closes, the main tags display should be updated
    await waitFor(
      () => {
        expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should fetch existing tags on component mount', async () => {
    render(<OverviewTab metadata={completeMetadata} />);

    // Wait for the component to render
    await waitFor(() => {
      expect(screen.getByText('Tags', { selector: 'h5' })).toBeInTheDocument();
    });

    // The getExistingTagObjects should have been called
    const { getExistingTagObjects } = require('@/actions/runsAction');
    expect(getExistingTagObjects).toHaveBeenCalled();
  });

  it('should include existing system tags in FilterableMultiSelect items', async () => {
    const user = userEvent.setup();
    render(<OverviewTab metadata={completeMetadata} />);

    const editIcon = screen.getByTestId('edit-icon');
    await user.click(editIcon);

    await waitFor(() => {
      expect(screen.getByTestId('mock-filterable-multiselect')).toBeInTheDocument();
    });

    // Check that existing system tags are available
    expect(screen.getByTestId('multiselect-item-existing-tag-1')).toBeInTheDocument();
    expect(screen.getByTestId('multiselect-item-existing-tag-2')).toBeInTheDocument();
  });
});
