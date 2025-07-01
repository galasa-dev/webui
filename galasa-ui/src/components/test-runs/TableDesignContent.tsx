/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import { useState } from "react";
import { closestCorners, DndContext, DragOverlay } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import styles from "@/styles/TestRunsPage.module.css";
import TableDesignRow from "./TableDesignRow";
import { Checkbox } from "@carbon/react";

const headers = [
  { header: "", key: "dragDrop" },
  { header: "Column Name", key: "columnName" },
];

interface TableDesignContentProps {
    selectedRowIds: string[];
    setSelectedRowIds: React.Dispatch<React.SetStateAction<string[]>>;
    tableRows: { id: string; columnName: string }[];
    setTableRows: React.Dispatch<React.SetStateAction<{ id: string; columnName: string }[]>>;
}

export default function TableDesignContent({selectedRowIds, setSelectedRowIds, tableRows, setTableRows}: TableDesignContentProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds((prev: string[]) => {
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

    if (selectedRowIds.length < tableRows.length) {
      setSelectedRowIds(rowIds);
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
      setTableRows((rows: { id: string; columnName: string }[]) => {
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
        <div className={styles.tableDesignContainer}>
          <div className={styles.tableDesignHeaderRow}>
            <div className={styles.cellDragHandle}>
              <strong>Drag to arrange columns</strong>
            </div>
            <div className={styles.cellCheckbox}>
              <Checkbox
                  id={`checkbox-all`}
                  isSelected={selectedRowIds.length === tableRows.length}
                  onChange={handleSelectAll}
              />
            </div>
            <div className={styles.cellValue}>
              <strong>Column Name</strong>
            </div>
          </div>
          <SortableContext items={tableRows.map(row => row.id)} strategy={verticalListSortingStrategy}>
          {
            tableRows.map((row) => (
              <TableDesignRow 
              key={row.id} 
              rowId={row.id} 
              value={row.columnName}
              isSelected={selectedRowIds.includes(row.id)}
              onSelect={handleRowSelect}
              onSelectAll={handleSelectAll}
              />
            )) 
          }
          </SortableContext>
        </div>
    </DndContext>
  );
}