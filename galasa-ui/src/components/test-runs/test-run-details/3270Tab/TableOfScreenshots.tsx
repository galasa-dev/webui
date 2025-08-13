/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';
import React, { useMemo, useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  DataTable,
  Pagination,
} from '@carbon/react';
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import { DataTableHeader, DataTableRow } from '@/utils/interfaces';
import { useTranslations } from 'next-intl';
import { TableContainer } from '@carbon/react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';

interface Cell {
  id: string;
  Terminal: number;
  ScreenNumber: number;
  Time: string;
  Method: string;
}

const rawData = [
  { Terminal: 1, ScreenNumber: 1, Time: '2023-01-01 12:00:00', Method: 'Method A' },
  { Terminal: 1, ScreenNumber: 2, Time: '2023-01-02 14:30:00', Method: 'Method B' },
  { Terminal: 1, ScreenNumber: 3, Time: '2023-01-03 09:45:00', Method: 'Method B' },
  { Terminal: 2, ScreenNumber: 1, Time: '2023-01-04 11:15:00', Method: 'Method C' },
  { Terminal: 2, ScreenNumber: 2, Time: '2023-01-05 16:20:00', Method: 'Method C' },
  { Terminal: 2, ScreenNumber: 3, Time: '2023-01-06 08:30:00', Method: 'Method C' },
  { Terminal: 3, ScreenNumber: 1, Time: '2023-01-01 12:00:00', Method: 'Method D' },
  { Terminal: 3, ScreenNumber: 2, Time: '2023-01-02 14:30:00', Method: 'Method D' },
  { Terminal: 3, ScreenNumber: 3, Time: '2023-01-03 09:45:00', Method: 'Method E' },
  { Terminal: 3, ScreenNumber: 4, Time: '2023-01-04 11:15:00', Method: 'Method E' },
  { Terminal: 3, ScreenNumber: 5, Time: '2023-01-05 16:20:00', Method: 'Method E' },
  { Terminal: 3, ScreenNumber: 6, Time: '2023-01-06 08:30:00', Method: 'Method E' },
];

const mockData: Cell[] = rawData.map((item) => ({
  ...item,
  id: `${item.Terminal}-${item.ScreenNumber}`,
}));

export default function TableOfScreenshots({
  runId,
}: {
  runId: string;
}) {
  const translations = useTranslations('3270Tab');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  // Paginated data based on currentPage and pageSize
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return mockData.slice(startIndex, endIndex);
  }, [currentPage, pageSize]);

  const handleRowClick = (runId: string, screenshotId: string) => {
    // Navigate to the test run details page
    router.push(`/test-runs/${runId}/${screenshotId}`);
  };

  const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div>
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
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
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
          `${min}–${max} ${translations('pagination.of')} ${total} ${translations('pagination.items')}`
        }
        pageRangeText={(current: number, total: number) =>
          `${translations('pagination.of')} ${total} ${translations('pagination.pages')}`
        }
        pageNumberText={translations('pagination.pageNumberText')}
        page={currentPage}
        pageSize={pageSize}
        pageSizes={[10, 20, 30, 40, 50]}
        totalItems={mockData.length}
        onChange={handlePaginationChange}
      />
    </div>
  );
}
