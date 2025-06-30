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
import { useEffect, useState} from "react";

const headers = [
  { header: "", key: "dragDrop" },
  { header: "Column Name", key: "columnName" },
];

const rows = [
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
];

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

export default function TableDesignContent() {
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);


  const handleRowSelect = (rowId: string) => {
    setSelectedRowIds(prev => {
        let currentSelectedRows;
        currentSelectedRows = prev.includes(rowId) ? 
         currentSelectedRows = prev.filter(id => id !== rowId) : currentSelectedRows = [...prev, rowId]; 
        return currentSelectedRows;
    })
  }

  const handleSelectAll = () => {
    const allSelected = selectedRowIds.length === rows.length;
    const rowIds = rows.map(row=>row.id);

    if (selectedRowIds.length < rows.length && selectedRowIds.length !== 0) {
        setSelectedRowIds([]);
    } else {
       setSelectedRowIds(allSelected ? [] : rowIds); 
    }
  }

  return (
    <DataTable rows={rows} headers={headers}>
      {({
        rows,
        headers,
        getTableProps,
        getHeaderProps,
        getRowProps,
        getSelectionProps,
        selectedRows,
      }: {
        rows: IDataTableRow[];
        headers: DataTableHeader[];
        getHeaderProps: (options: any) => TableHeadProps;
        getRowProps: (options: any) => TableRowProps;
        getTableProps: () => TableBodyProps;
        getSelectionProps: (options?: any) => any;
        selectedRows: IDataTableRow[];
      }) => {
        const allSelected = selectedRowIds.length === rows.length;
        const someSelected = selectedRowIds.length > 0 && selectedRowIds.length < rows.length
        return (
          <TableContainer>
            <Table {...getTableProps()} aria-label="table design" size="lg" >
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
                      />
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
      }}
    </DataTable>
  );
}
