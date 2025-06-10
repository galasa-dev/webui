
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
  Pagination, Loading
} from '@carbon/react';
import { DataTableHeader, DataTableRow, DataTableCell as IDataTableCell } from "@/utils/interfaces";
import styles from "@/styles/TestRunsPage.module.css";
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import StatusIndicator from "../common/StatusIndicator";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from 'next/navigation'; 
import { fetchMyTestRunsForLastDay } from "@/actions/getTestRuns";
import ErrorPage from "@/app/error/page";

interface CustomCellProps  {
  header: string;
  value: any;
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
      submittedAt: structure.queued ? new Date(structure.queued).toLocaleString().replace(',', '') : 'N/A',
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
const CustomCell = ({ header, value }: CustomCellProps) => {
  if (header === 'result') {
    return (
      <TableCell>
        <StatusIndicator status={value as string} />
      </TableCell>
    );
  }

  return <TableCell>{value}</TableCell>;
};

export default function TestRunsTable() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [rawRuns, setRawRuns] = useState<Run[]>([]);

  // Fetch all runs data on component mount
  useEffect(() => {
    const loadRuns = async() => {
      setIsLoading(true);
      try {
        const runsData = await fetchMyTestRunsForLastDay();
        setRawRuns(runsData);
      } catch (error) {
        console.error('Error fetching runs:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadRuns();
  }, []);

  // Transform the raw runs data into a format suitable for the DataTable
  const tableRows = useMemo(() => transformRunsforTable(rawRuns), [rawRuns]);

  // Calculate the paginated rows based on the current page and page size
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return tableRows.slice(startIndex, endIndex);
  }, [tableRows, currentPage, pageSize]);

  // Generate the time frame text based on the runs data
  const timeFrameText = useMemo(() => {
    if (!rawRuns || rawRuns.length === 0) {
      return 'No test runs found in the last 24 hours.';
    }

    let text = 'Showing test runs submitted in the last 24 hours';
    const dates = rawRuns.map(run => new Date(run.testStructure?.queued || 0).getTime());
    const earliestDate = new Date(Math.min(...dates));
    const latestDate = new Date(Math.max(...dates));

    if(earliestDate && latestDate) {
      text = `Showing test runs submitted between ${earliestDate.toLocaleString().replace(',', '')} and ${latestDate.toLocaleString().replace(',', '')}`;
    }
    return text;
  }, [rawRuns]);

  const handlePaginationChange = ({page, pageSize} : {page: number, pageSize: number}) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // Navigate to the test run details page using the runId
  const handleRowClick = (runId: string) => {
    router.push(`/test-runs/${runId}`);
  };

  if(isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <Loading description="Loading test runs..." withOverlay={false}/>;
  }

  if( !tableRows || tableRows.length === 0) {
    return <p>No test runs found in the last 24 hours.</p>;
  }

  return (
    <div className={styles.resultsPageContainer}>
      <p className={styles.timeFrameText}>{timeFrameText}</p>
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
                    <TableRow key={row.id} {...getRowProps({ row })} onClick={() => handleRowClick(row.id)}>
                      {row.cells.map((cell) => 
                        <CustomCell key={cell.id} value={cell.value} header={cell.info.header} />)}
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
