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
import { TreeNodeData } from '@/utils/functions/artifacts';
import styles from '@/styles/test-runs/test-run-details/tab3270.module.css';
import { CellFor3270, TerminalImage } from '@/utils/interfaces/common';

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
  setImageData: React.Dispatch<React.SetStateAction<TerminalImage | undefined>>;
}) {
  const translations = useTranslations('3270Tab');
  const headers = [
    {
      key: 'Terminal',
      header: translations('Terminal'),
    },
    {
      key: 'ScreenNumber',
      header: translations('ScreenNumber'),
    },
  ];

  const [flattenedZos3270TerminalData, setFlattenedZos3270TerminalData] = useState<CellFor3270[]>(
    []
  );
  const [allImageData, setAllImageData] = useState<TerminalImage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTerminal, setSelectedTerminal] = useState<DropdownOption | null>(null);

  let screenshotsCollected: boolean = false;

  const handleRowClick = (runId: string, screenshotId: string) => {
    console.log("HELLO4");
    const newImageData: TerminalImage = allImageData.find(
      (image) => image.id === screenshotId
    ) as TerminalImage;
    setImageData(newImageData);
  };

  const terminalnames = useMemo(() => {
    const names = new Set(flattenedZos3270TerminalData.map((row: CellFor3270) => row.Terminal));
    return [
      { id: 'all', label: 'All' },
      ...Array.from(names).map((name) => ({ id: name, label: name })),
    ];
  }, [flattenedZos3270TerminalData]);

  const filteredRows = useMemo(() => {
    console.log("HELLO" + JSON.stringify(flattenedZos3270TerminalData));

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

  useEffect(() => {
    // Ensure screenshots are only collected once.
    if (!screenshotsCollected) {
      screenshotsCollected = true;

      setIsLoading(true);
      const fetchData = async () => {
        try {
          setFlattenedZos3270TerminalData([]);
          setAllImageData([]);
          const { newFlattenedZos3270TerminalData, newAllImageData } = await get3270Screenshots(
            zos3270TerminalData,
            runId
          );
          console.log("HELLO1" + JSON.stringify(newFlattenedZos3270TerminalData) + " " + JSON.stringify(newAllImageData));
          setFlattenedZos3270TerminalData(newFlattenedZos3270TerminalData);
          setAllImageData(newAllImageData);
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
      <DataTableSkeleton
        data-testid="loading-table-skeleton"
        columnCount={headers.length}
        rowCount={15}
      />
    );
  }

  return (
    <DataTable isSortable rows={filteredRows} headers={headers}>
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
              }}
              data-testid="search-input"
            />
            <Dropdown
              className={styles.terminalDropdownMenu}
              label="Select a terminal"
              items={terminalnames}
              itemToString={(item: DropdownOption | null) => (item ? item.label : '')}
              onChange={({ selectedItem }: { selectedItem: DropdownOption | null }) => {
                setSelectedTerminal(selectedItem);
              }}
              selectedItem={selectedTerminal}
              data-testid="terminal-input"
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
            <TableBody className={styles.tableBodyComponent}>
              {rows.map((row) => (
                <TableRow
                  key={row.id}
                  {...getRowProps({ row })}
                  onClick={() => handleRowClick(runId, row.id)}
                  className={styles.clickableRow}
                  data-testid="table-row"
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
  );
}
