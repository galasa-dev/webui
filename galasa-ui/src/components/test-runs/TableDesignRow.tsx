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
import {  Draggable } from "@carbon/icons-react";
import { useTranslations } from "next-intl";

interface TableDesignRowProps {
  rowId: string;
  isSelected: boolean;
  onSelect: (rowId: string) => void;
}

export default function TableDesignRow({ rowId,  isSelected,  onSelect }: TableDesignRowProps) {
  const translations = useTranslations("TableDesignRow");

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
  };

  return ( 
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes} 
      className={`${styles.tableDesignRow} ${isDragging ? styles.dragging : ''}`}
      id={rowId}
    >
      <div className={styles.tableDesignIcons}>
        <IconButton 
          kind="ghost" 
          label={translations("dragAndDropLabel")}
          className={styles.dragHandle}
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

      <p className={styles.cellValue}>{translations(rowId)}</p>
    </div>
  );
};