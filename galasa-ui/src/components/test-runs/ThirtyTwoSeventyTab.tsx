/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

// (TODO: Delete me) Test run with 3270 terminal example: CEMTManagerIVT http://localhost:3000/test-runs/cdb-230fb4cb-f339-43de-8ef7-559a3c2c249d-1754373621270-C25104

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
import styles from '@/styles/tab3270.module.css';
import { DataTableHeader, DataTableRow } from '@/utils/interfaces';
import { useTranslations } from 'next-intl';

interface Cell {
  id: number;
  Terminal: number;
  ScreenNumber: number;
  Time: string;
  Method: string;
}

const rows: Cell[] = [
  { id: 1, Terminal: 1, ScreenNumber: 1, Time: '2023-01-01 12:00:00', Method: 'Method A' },
  { id: 2, Terminal: 1, ScreenNumber: 2, Time: '2023-01-02 14:30:00', Method: 'Method B' },
  { id: 3, Terminal: 1, ScreenNumber: 3, Time: '2023-01-03 09:45:00', Method: 'Method B' },
  { id: 4, Terminal: 2, ScreenNumber: 1, Time: '2023-01-04 11:15:00', Method: 'Method C' },
  { id: 5, Terminal: 2, ScreenNumber: 2, Time: '2023-01-05 16:20:00', Method: 'Method C' },
  { id: 6, Terminal: 2, ScreenNumber: 3, Time: '2023-01-06 08:30:00', Method: 'Method C' },
  { id: 1, Terminal: 1, ScreenNumber: 1, Time: '2023-01-01 12:00:00', Method: 'Method A' },
  { id: 2, Terminal: 1, ScreenNumber: 2, Time: '2023-01-02 14:30:00', Method: 'Method B' },
  { id: 3, Terminal: 1, ScreenNumber: 3, Time: '2023-01-03 09:45:00', Method: 'Method B' },
  { id: 4, Terminal: 2, ScreenNumber: 1, Time: '2023-01-04 11:15:00', Method: 'Method C' },
  { id: 5, Terminal: 2, ScreenNumber: 2, Time: '2023-01-05 16:20:00', Method: 'Method C' },
  { id: 6, Terminal: 2, ScreenNumber: 3, Time: '2023-01-06 08:30:00', Method: 'Method C' },
];

export default function ThirtyTwoSeventyTab() {
  const translations = useTranslations('3270Tab');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return rows.slice(startIndex, endIndex);
  }, [rows, currentPage, pageSize]);

  const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  return (
    <div>
      <div className={styles.terminalScreenshotTableContainer}>
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
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
          totalItems={rows.length}
          onChange={handlePaginationChange}
        />
      </div>
    </div>
  );
}

