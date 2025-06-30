/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import {

  TableCell,
} from "@carbon/react";

import { IconButton } from "@carbon/react";
import { Draggable } from "@carbon/icons-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function DraggableHandle({ rowId }: { rowId: string }) {
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
