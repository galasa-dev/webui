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
import { useEffect, useState, useRef } from "react";

const headers = [
  { header: "", key: "dragDrop" },
  { header: "Column Name", key: "columnName" },
];

const rows = [
  { id: "test-submission", columnName: "Test Submission" },
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
  const [selectedRowsState, setSelectedRowsState] = useState<IDataTableRow[]>([]);
  const selectedRowsRef = useRef<IDataTableRow[]>([]);

  useEffect(() => {
    console.log("Selected rows updated:", selectedRowsRef.current);

    console.log(selectedRowsRef.current);
  }, [selectedRowsState]);

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
        // Update ref with current selection
        selectedRowsRef.current = selectedRows;
        
        // Update state if selected rows have changed
        if (JSON.stringify(selectedRows) !== JSON.stringify(selectedRowsState)) {
          setSelectedRowsState(selectedRows);
        }

        return (
          <TableContainer>
            <Table {...getTableProps()} aria-label="table design" size="lg" >
              <TableHead>
                <TableRow>
                  <TableSelectAll {...getSelectionProps()} />
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
                    <TableSelectRow {...getSelectionProps({ row })} />
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
