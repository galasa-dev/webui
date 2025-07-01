/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import styles from "@/styles/TestRunsPage.module.css";
import { Checkbox } from "@carbon/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconButton } from "@carbon/react";
import { Draggable } from "@carbon/icons-react";

interface TableDesignRowProps {
  rowId: string;
  value: string;
  isSelected: boolean;
  onSelect: (rowId: string) => void;
  onSelectAll: () => void; 
}

export default function TableDesignRow({ rowId, value, isSelected,  onSelect,onSelectAll}: TableDesignRowProps) {
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
      <div 
        ref={setNodeRef}
        style={style}
        {...attributes} 
        className={styles.tableDesignRow}
        id={rowId}
      >
        <div className={styles.cellDragHandle}>
        <IconButton 
      kind="ghost" 
      label="Drag to reorder"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      {...listeners} 
    >
      <Draggable size={20} />
    </IconButton>
        </div>
        
        <div className={styles.cellCheckbox}>
          <Checkbox
            id={`checkbox-${rowId}`}
            checked={isSelected}
            onChange={() => onSelect(rowId)}
          />
        </div>

        <p className={styles.cellValue}>{value}</p>
      </div>
    );
};