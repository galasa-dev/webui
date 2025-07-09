/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import TableDesignContent from "@/components/test-runs/TableDesignContent";
import { render, screen, fireEvent } from '@testing-library/react';

// Mock Child Components
jest.mock('@/components/test-runs/TableDesignRow', () => ({
  __esModule: true,
  default: ({ rowId, value, isSelected, onSelect, onClickArrowUp, onClickArrowDown }: any) => (
    <div data-testid={`row-${rowId}`}>
      <input
        data-testid={`checkbox-${rowId}`}
        type="checkbox"
        checked={isSelected}
        onChange={() => onSelect(rowId)}
        aria-label={value}
      />
      <span>{value}</span>
      <button data-testid={`arrow-up-${rowId}`} onClick={onClickArrowUp}>↑</button>
      <button data-testid={`arrow-down-${rowId}`} onClick={onClickArrowDown}>↓</button>
    </div>
  ),
}));

// Mock the DndContext to capture the onDragEnd function for testing
let capturedOnDragEnd: (event: any) => void;
jest.mock('@dnd-kit/core', () => ({
  ...jest.requireActual('@dnd-kit/core'),
  DndContext: ({ children, onDragEnd }: any) => {
    capturedOnDragEnd = onDragEnd;
    return <div>{children}</div>;
  },
}));

// Mock the useTranslations hook from next-intl
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      "description": "Customize your table view by showing, hiding, and reordering columns.",
      "dragAndDropHeader": "Drag columns to reorder",
      "columnName": "Column Name",
      "noColumnsSelected": "No columns selected – nothing to display. Please select one or more columns."
    };
    return translations[key] || key;
  },
}));

// Mock test data
const mockTableRows = [
  { id: 'testName', columnName: 'Test Name' },
  { id: 'requestor', columnName: 'Requestor' },
  { id: 'status', columnName: 'Status' },
];

describe("TableDesignContent Component", () => {
  let mockSetSelectedRowIds: jest.Mock;
  let mockSetTableRows: jest.Mock;

  beforeEach(() => {
    mockSetSelectedRowIds = jest.fn();
    mockSetTableRows = jest.fn();
  });

  describe("Rendering", () => {
    test("renders correctly without crashing", () => {
      render(
        <TableDesignContent 
          selectedRowIds={['testName']}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );
      expect(screen.getByText(/Customize your table view/i)).toBeInTheDocument();
      expect(screen.getByText('Column Name')).toBeInTheDocument();
    });

    test('should check the "Select All" checkbox if all rows are selected', () => {
      const allRowIds = mockTableRows.map(row => row.id);
      render(
        <TableDesignContent 
          selectedRowIds={allRowIds}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );
      const selectAllCheckbox = screen.getByRole('checkbox', { name: 'Select all rows' });
      expect(selectAllCheckbox).toBeChecked();
    });
  });

  describe("Checkbox Selection Logic", () => {
    test("selects all rows when 'Select All' is clicked", () => {
      render(
        <TableDesignContent 
          selectedRowIds={[]}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(mockSetSelectedRowIds).toHaveBeenCalledWith(mockTableRows.map(row => row.id));
    });

    test('deselects all rows when "Select All" is clicked while all are selected', () => {
      const allRowIds = mockTableRows.map(row => row.id);
      render(
        <TableDesignContent
          selectedRowIds={allRowIds}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );
      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(mockSetSelectedRowIds).toHaveBeenCalledWith([]);
    });

    test("displays a warning message when no columns are selected", () => {
      render(
        <TableDesignContent 
          selectedRowIds={[]}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={[]}
          setTableRows={mockSetTableRows}
        />
      );

      expect(screen.getByText(/No columns selected – nothing to display/i)).toBeInTheDocument();
    });

    test('should call setSelectedRowIds with the correct row ID when a row checkbox is clicked', () => {
      const initialSelectedRowIds = ['testName'];
      render(
        <TableDesignContent 
          selectedRowIds={initialSelectedRowIds}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );

      const requestorCheckbox = screen.getByTestId('checkbox-requestor');
      requestorCheckbox.click();

      expect(mockSetSelectedRowIds).toHaveBeenCalledWith(expect.any(Function));

      const updaterFunction = mockSetSelectedRowIds.mock.calls[0][0];
      expect(updaterFunction(initialSelectedRowIds)).toEqual(['testName', 'requestor']);
    });
  });

  describe("Row Reordering Logic", () => {
    test('should call setTableRows with new order on drag end', () => {
      render(
        <TableDesignContent 
          selectedRowIds={[]}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );

      // Simulate dragging 'status' (index 2) over 'testName' (index 0)
      const event = { active: { id: 'status' }, over: { id: 'testName' } };
      capturedOnDragEnd(event);

      expect(mockSetTableRows).toHaveBeenCalledWith(expect.any(Function));

      // Verify the logic of the functional update
      const updaterFunction = mockSetTableRows.mock.calls[0][0];
      const newOrder = updaterFunction(mockTableRows);
      const newOrderIds = newOrder.map((row: any) => row.id);
      expect(newOrderIds).toEqual(['status', 'testName', 'requestor']);
    });

    test('should not move the top row up', () => {
      render(
        <TableDesignContent 
          selectedRowIds={[]}
          setSelectedRowIds={mockSetSelectedRowIds}
          tableRows={mockTableRows}
          setTableRows={mockSetTableRows}
        />
      );
            
      // Attempt to click the up arrow on the first item
      const arrowUpButton = screen.getByTestId('arrow-up-testName');
      fireEvent.click(arrowUpButton);

      // Assert that the state update function was NOT called
      expect(mockSetTableRows).not.toHaveBeenCalled();
    });
  });
});