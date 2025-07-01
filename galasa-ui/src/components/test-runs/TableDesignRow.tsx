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
import { ChevronDownOutline, ChevronUpOutline, Draggable } from "@carbon/icons-react";
import { RESULTS_TABLE_COLUMNS } from "@/utils/constants/common";
import { useTranslations } from "next-intl";

interface TableDesignRowProps {
  rowId: string;
  index: number;
  isSelected: boolean;
  onSelect: (rowId: string) => void;
  onClickArrowUp: () => void;
  onClickArrowDown: () => void;
}

export default function TableDesignRow({ rowId, index, isSelected,  onSelect, onClickArrowUp, onClickArrowDown }: TableDesignRowProps) {
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
      <div className={styles.tableDesignIcons}>
        <IconButton 
          kind="ghost" 
          label={translations("dragAndDropLabel")}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          {...listeners} 
        >
          <Draggable size={20} />
        </IconButton>
        <IconButton
          kind="ghost"
          label={translations("moveUpLabel")}
          onClick={onClickArrowUp}
          className={styles.arrowUpButton}
          style={{ visibility: index === 0 ? 'hidden' : 'visible' }}
        >
          <ChevronUpOutline size={19}/>  
        </IconButton>
        <IconButton
          kind="ghost"
          label={translations("moveDownLabel")}
          onClick={onClickArrowDown}
          className={styles.arrowDownButton}
          style={{ visibility: index === RESULTS_TABLE_COLUMNS.length - 1 ? 'hidden' : 'visible' }}
        >
          <ChevronDownOutline size={19}/>
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