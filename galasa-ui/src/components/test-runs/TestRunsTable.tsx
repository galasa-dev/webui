
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Run } from "@/generated/galasaapi";
import {  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  Pagination
} from '@carbon/react';
import { DataTableHeader, DataTableRow, DataTableCell as IDataTableCell } from "@/utils/interfaces";
import styles from "@/styles/TestRunsPage.module.css";
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import StatusIndicator from "../common/StatusIndicator";
import { useMemo, useState } from "react";

interface ResultsTableProps {
  runs: Run[];
}

interface CustomCellProbs  {
  cell: IDataTableCell;
}

const headers = [
  { key: 'submittedAt', header: 'Submitted at' }, 
  { key: 'testRunName', header: 'Test Run Name' }, 
  { key: 'requestor', header: 'Requestor' }, 
  { key: 'group', header: 'Group' }, 
  { key: 'bundle', header: 'Bundle' }, 
  { key: 'package', header: 'Package' }, 
  { key: 'testName', header: 'Test Name' },
  { key: 'status', header: 'Status' },
  { key: 'result', header: 'Result'}
];


/**
 * Transforms and flattens the raw API data for Carbon DataTable.
 * @param runs - The array of run objects from the API.
 * @returns A new array of flat objects, each with a unique `id` and properties matching the headers.
 */
const transformRunsforTable = (runs: Run[]) => {
  if(!runs) {
    return [];
  }

  return runs.map((run) => {
    const structure = run.testStructure || {};

    return {
      id: run.runId,
      submittedAt: structure.queued ? new Date(structure.queued).toLocaleString() : 'N/A',
      testRunName: structure.runName,
      requestor: structure.requestor,
      group: structure.group,
      bundle: structure.bundle,
      package: structure.testName?.substring(0, structure.testName.lastIndexOf('.')) || 'N/A',
      testName: structure.testShortName,
      status: structure.status,
      result: structure.result || 'N/A',
    };
  });
};

/**
 * This component encapsulates the logic for rendering a cell.
 * It renders a special layout for the 'result' column and a default for all others.
 */
const CustomCell = ({cell}: CustomCellProbs) => {
  if (cell.info.header === 'result') {
    return (
      <TableCell key={cell.id}>
        <StatusIndicator status={cell.value} />
      </TableCell>
    );
  }

  return <TableCell key={cell.id}>{cell.value}</TableCell>;
};

export default function TestRunsTable({runs}: ResultsTableProps) {
  const tableRows = useMemo(() => transformRunsforTable(runs), [runs]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Calculate the paginated rows based on the current page and page size
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tableRows.slice(startIndex, endIndex);
  }, [tableRows, currentPage, pageSize]);

  const handlePaginationChange = ({page, pageSize} : {page: number, pageSize: number}) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  }

  return (
    <div className={styles.resultsPageContainer}>
      <p>Showing results of the last 24 hours</p>
      <div className={styles.testRunsTableContainer}>
        <DataTable rows={paginatedRows} headers={headers}>
          {({ 
            rows,
            headers,
            getTableProps, 
            getHeaderProps, 
            getRowProps }: {
          rows: DataTableRow[];
          headers: DataTableHeader[];
          getHeaderProps: (options: any) => TableHeadProps;
          getRowProps: (options: any) => TableRowProps;
          getTableProps: () => TableBodyProps;
        }) => (
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  <TableRow>
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
                      {row.cells.map((cell) => 
                        <CustomCell key={cell.id} cell={cell} />)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DataTable>
        <Pagination
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          page={currentPage}
          pageNumberText="Page Number"
          pageSize={pageSize}
          pageSizes={[
            10,
            20,
            30,
            40,
            50
          ]}
          totalItems={tableRows.length}
          onChange={handlePaginationChange}
        />
      </div>
    </div>
  );
}
