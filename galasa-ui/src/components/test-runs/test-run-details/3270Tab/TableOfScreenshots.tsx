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
  Dropdown,
  TableToolbarSearch,
  TableToolbarContent,
  TableContainer,
} from '@carbon/react';
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import { DataTableHeader, DataTableRow } from '@/utils/interfaces';
import { get3270Screenshots } from '@/utils/3270/get3270Screenshots';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { TreeNodeData } from '@/utils/functions/artifacts';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { CellFor3270 } from '@/utils/interfaces/common';

interface DropdownOption {
  id: string;
  label: string;
}

export default function TableOfScreenshots({
  runId,
  zos3270TerminalData,
  isLoading,
  setIsError,
  setIsLoading,
  setImageData,
}: {
  runId: string;
  zos3270TerminalData: TreeNodeData[];
  isLoading: boolean;
  setIsError: React.Dispatch<React.SetStateAction<boolean>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setImageData: React.Dispatch<React.SetStateAction<boolean>>;
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
    // TODO 3270: Once the server-side logic is completed, these headers can be placed back in. Leaving this commented out for now to save time for later.
    // {
    //   key: 'Time',
    //   header: translations('Time'),
    // },
    // {
    //   key: 'Method',
    //   header: translations('Method'),
    // },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [flattenedZos3270TerminalData, setFlattenedZos3270TerminalData] = useState<CellFor3270[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<DropdownOption | null>(null);

  let screenshotsCollected: boolean = false;

  function updateViewportHeight(newHeight: string) {
    const element = document.querySelector('.tab3270_tab3270Container__scykF') as HTMLElement;
    element.style.setProperty('--viewport-height', newHeight);
  }

  const handleRowClick = (runId: string, screenshotId: string) => {
    // Navigate to the test run details page
    // router.push(`/test-runs/${runId}/${screenshotId}`);
  };

  const handlePaginationChange = ({ page, pageSize }: { page: number; pageSize: number }) => {
    setCurrentPage(page);
    setPageSize(pageSize);

    // Manually update height due to flexbox interfering with position: sticky.
    if (pageSize > 16) {
      const amountToIncreaseBy = 48 * (pageSize - 16);
      updateViewportHeight(`calc(100vh + ` + amountToIncreaseBy + `px)`);
    } else {
      updateViewportHeight(`100vh`);
    }
  };

  const terminalnames = useMemo(() => {
    const names = new Set(flattenedZos3270TerminalData.map((row: CellFor3270) => row.Terminal));
    return [
      { id: 'all', label: 'All' },
      ...Array.from(names).map((name) => ({ id: name, label: name })),
    ];
  }, [flattenedZos3270TerminalData]);

  // 1. Filter all rows based on the search term and temrinal selection
  const filteredRows = useMemo(() => {
    let result: CellFor3270[] = flattenedZos3270TerminalData;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      result = result.filter((row: CellFor3270) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerCaseSearchTerm)
        )
      );
    }

    if (selectedTerminal && selectedTerminal.id !== 'all') {
      result = result.filter((row) => row.Terminal === selectedTerminal.id);
    }

    return result;
  }, [searchTerm, selectedTerminal, flattenedZos3270TerminalData]);

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
          setFlattenedZos3270TerminalData(
            await get3270Screenshots(zos3270TerminalData, runId, setIsError)
          );
          setIsLoading(false);
        } catch (error) {
          console.error('Error fetching data:', error);
          setIsError(true);
          setIsLoading(false);
        }
      };

      fetchData();

      // Initial setting to 100vh for terminal image.
      updateViewportHeight(`100vh`);
    }
  }, []);

  if (isLoading) {
    return (
      <>
        <DataTableSkeleton
          data-testid="loading-table-skeleton"
          columnCount={headers.length}
          rowCount={pageSize}
        />
      </>
    );
  }

  return (
    <>
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
                onChange={(e: any) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <Dropdown
                className={styles.terminalDropdownMenu}
                label="Select a terminal"
                items={terminalnames}
                itemToString={(item: DropdownOption | null) => (item ? item.label : '')}
                onChange={({ selectedItem }: { selectedItem: DropdownOption | null }) => {
                  setSelectedTerminal(selectedItem);
                  setCurrentPage(1);
                }}
                selectedItem={selectedTerminal}
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
        totalItems={filteredRows.length}
        onChange={handlePaginationChange}
      />
    </>
  );
}
