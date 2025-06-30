/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import {
    TableRow,
    TableCell,
    TableSelectRow,
  } from "@carbon/react";
  import { IconButton } from "@carbon/react";
  import { Draggable } from "@carbon/icons-react";
  import { useState} from "react";
  import {
    DataTableHeader,
    DataTableRow as IDataTableRow,
  } from "@/utils/interfaces";
  import { TableRowProps } from "@carbon/react/lib/components/DataTable/TableRow";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


const CustomCell = ({ header, value }: { header: string; value: any }) => {
    if (header === "dragDrop") {
      return (
        <TableCell>
          <IconButton kind="ghost" label="Drag to reorder">
            <Draggable size={18} />
          </IconButton>
        </TableCell>
      );
    }
    return <TableCell>{value}</TableCell>;
};

interface TableDesignRowProps {
    row: IDataTableRow;
    getRowProps: (options: any) => TableRowProps;
    getSelectionProps: (options?: any) => any;
    selectedRowIds: string[],
    handleRowSelect: any
}

export default function TableDesignRow({getRowProps, getSelectionProps, selectedRowIds, row, handleRowSelect}: TableDesignRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
    
    const style = {
        transition, 
        transform: CSS.Transform.toString(transform)
    }
     
    return (
        <TableRow 
        ref={setNodeRef} 
        {...attributes}
        {...listeners} 
        style={style}
        {...getRowProps({ row })}
        >
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
            />
            ))}
      </TableRow>
    )
}