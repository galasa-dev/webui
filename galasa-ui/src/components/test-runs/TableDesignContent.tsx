/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import {
  DataTable,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectAll,
  TableSelectRow,
} from "@carbon/react";
import {
  DataTableHeader,
  DataTableRow as IDataTableRow,
} from "@/utils/interfaces";
import { TableRowProps } from "@carbon/react/lib/components/DataTable/TableRow";
import { TableHeadProps } from "@carbon/react/lib/components/DataTable/TableHead";
import { TableBodyProps } from "@carbon/react/lib/components/DataTable/TableBody";
import { IconButton } from "@carbon/react";
import { Draggable } from "@carbon/icons-react";
import { useState } from "react";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "@/styles/TestRunsPage.module.css";

const headers = [
  { header: "", key: "dragDrop" },
  { header: "Column Name", key: "columnName" },
];

// Draggable Handle Component
const DraggableHandle = ({ rowId }: { rowId: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableCell>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
      >
        <IconButton 
          kind="ghost" 
          label="Drag to reorder"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <Draggable size={20} />
        </IconButton>
      </div>
    </TableCell>
  );
};

const CustomCell = ({ header, value, rowId }: { header: string; value: any; rowId: string }) => {
  if (header === "dragDrop") {
    return <DraggableHandle rowId={rowId} />;
  }
  return <TableCell>{value}</TableCell>;
};

export default function TableDesignContent() {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [tableRows, setRows] = useState<{ id: string; columnName: string }[]>([
    { id: "test-run-name", columnName: "Test Run name" },
    { id: "requestor", columnName: "Requestor" },
    { id: "submission-id", columnName: "Submission ID" },
    { id: "group", columnName: "Group" },
    { id: "bundle", columnName: "Bundle" },
    { id: "package", columnName: "Package" },
    { id: "test-name", columnName: "Test Name" },
    { id: "status", columnName: "Status" },
    { id: "tags", columnName: "Tags" },
    { id: "result", columnName: "Result" },
  ]);

  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds(prev => {
      if (prev.includes(rowId)) {
        return prev.filter(id => id !== rowId);
      } else {
        return [...prev, rowId];
      }
    });
  };

  const handleSelectAll = () => {
    const allSelected = selectedRowIds.length === tableRows.length;
    const rowIds = tableRows.map(row => row.id);

    if (selectedRowIds.length < tableRows.length && selectedRowIds.length !== 0) {
      setSelectedRowIds([]);
    } else {
      setSelectedRowIds(allSelected ? [] : rowIds); 
    }
  };

  const getRowPosition = (id: string) => tableRows.findIndex(row => row.id === id);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setRows(rows => {
        const originalPosition = getRowPosition(active.id);
        const newPosition = getRowPosition(over.id);
        return arrayMove(rows, originalPosition, newPosition);
      });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCorners}
    >
     <p className={styles.titleText}>Adjust the column ordering, allowable values, and whether columns are visible or not</p>
      <DataTable rows={tableRows} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
        }: {
          rows: IDataTableRow[];
          headers: DataTableHeader[];
          getHeaderProps: (options: any) => TableHeadProps;
          getRowProps: (options: any) => TableRowProps;
          getTableProps: () => TableBodyProps;
          getSelectionProps: (options?: any) => any;
        }) => {
          const allSelected = selectedRowIds.length === rows.length;
          const someSelected = selectedRowIds.length > 0 && selectedRowIds.length < rows.length;
          
          return (
            <TableContainer className={styles.designTableContainer}>
              <Table {...getTableProps()} aria-label="table design" size="lg">
                <TableHead>
                  <TableRow>
                    <TableSelectAll
                      {...getSelectionProps()}
                      checked={allSelected}
                      indeterminate={someSelected}
                      onSelect={handleSelectAll}
                    />
                    {headers.map((header) => (
                      <TableHeader key={header.key} {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <SortableContext items={rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
                    {rows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        <TableSelectRow
                          {...getSelectionProps({ row })}
                          checked={selectedRowIds.includes(row.id)}
                          onSelect={() => handleRowSelect(row.id)}
                        />
                        {row.cells.map((cell) => (
                          <CustomCell
                            key={cell.id}
                            value={cell.value}
                            header={cell.info.header}
                            rowId={row.id}
                          />
                        ))}
                      </TableRow>
                    ))}
                  </SortableContext>
                </TableBody>
              </Table>
              <DragOverlay>
                {activeId ? (
                  <div className={styles.dragOverlay}>
                    {tableRows.find(row => row.id === activeId)?.columnName}
                  </div>
                ) : null}
              </DragOverlay>
            </TableContainer>
          );
        }}
      </DataTable>
    </DndContext>
  );
}