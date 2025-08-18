/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  DataTable,
  Pagination,
  DataTableSkeleton,
} from '@carbon/react';
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import { DataTableHeader, DataTableRow } from '@/utils/interfaces';
import { get3270Screenshots } from '@/utils/3270/get3270Screenshots';
import { useTranslations } from 'next-intl';
import { TableContainer } from '@carbon/react';
import { useRouter } from 'next/navigation';
import { TreeNodeData } from '@/utils/functions/artifacts';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { TableToolbarContent } from '@carbon/react';
import { TableToolbarSearch } from '@carbon/react';

export default function TableOfScreenshots({
  runId,
  zos3270TerminalData,
  setIsError,
  isLoading,
  setIsLoading,
}: {
  runId: string;
  zos3270TerminalData: TreeNodeData[];
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const translations = useTranslations('3270Tab');
  const router = useRouter();
  const headers = [
    {
      key: 'Terminal',
      header: translations('Terminal'),
    },
    {
      key: 'ScreenNumber',
      header: translations('ScreenNumber'),
    },
    {
      key: 'Time',
      header: translations('Time'),
    },
    {
      key: 'Method',
      header: translations('Method'),
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [flattenedZos3270TerminalData, setFlattenedZos3270TerminalData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState('');

  let screenshotsCollected: boolean = false;

  const handleRowClick = (runId: string, screenshotId: string) => {
    // Navigate to the test run details page
    router.push(`/test-runs/${runId}/${screenshotId}`);
  };

  const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  // 1. Filter all rows based on the search term
  const filteredRows = useMemo(() => {
    if (!searchTerm || searchTerm === '') {
      return flattenedZos3270TerminalData;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return flattenedZos3270TerminalData.filter((row: any) =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(lowerCaseSearchTerm)
      )
    );
  }, [searchTerm, flattenedZos3270TerminalData]);

  // 2. Paginate filtered rows
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRows.slice(startIndex, endIndex);
  }, [currentPage, pageSize, filteredRows]);

  useEffect(() => {
    if (!screenshotsCollected) {
      screenshotsCollected = true;

      setIsLoading(true);
      const fetchData = async () => {
        try {
          setFlattenedZos3270TerminalData([]);
          setFlattenedZos3270TerminalData(await get3270Screenshots(zos3270TerminalData, runId, setIsError));
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsError(true);
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, []);

  if (isLoading) {
    return (
      <div>
        <DataTableSkeleton
          data-testid="loading-table-skeleton"
          columnCount={headers.length}
          rowCount={pageSize}
        />
      </div>
    );
  }

  return (
    <div className={styles.tableOfScreenshotsContainer}>
      <DataTable isSortable rows={paginatedRows} headers={headers}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
        }: {
          rows: DataTableRow[];
          headers: DataTableHeader[];
          getHeaderProps: (options: any) => TableHeadProps;
          getRowProps: (options: any) => TableRowProps;
          getTableProps: () => TableBodyProps;
        }) => (
          <TableContainer>
            <TableToolbarContent>
              <TableToolbarSearch
                placeholder={translations('searchPlaceholder')}
                persistent
                onChange={(e:any) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </TableToolbarContent>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.header} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    {...getRowProps({ row })}
                    onClick={() => handleRowClick(runId, row.id)}
                    className={styles.clickableRow}
                  >
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
      <Pagination
        backwardText={translations('pagination.backwardText')}
        forwardText={translations('pagination.forwardText')}
        itemsPerPageText={translations('pagination.itemsPerPageText')}
        itemRangeText={(min: number, max: number, total: number) =>
          `${total} ${translations('pagination.items')}`
        }
        pageRangeText={(current: number, total: number) =>
          `${translations('pagination.of')} ${total} ${translations('pagination.pages')}`
        }
        pageNumberText={translations('pagination.pageNumberText')}
        page={currentPage}
        pageSize={pageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={flattenedZos3270TerminalData.length}
        onChange={handlePaginationChange}
      />
    </div>
  );
}
