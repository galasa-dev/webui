/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';
import React from 'react';
import { Table } from '@carbon/react';
import { TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import dynamic from 'next/dynamic';


export function rowData (row: {id: string; tokenName: string; scope: string; expires: string;}){
    return (
        <TableRow key={row.id}>
            <TableCell>{row.tokenName}</TableCell>
            <TableCell>{row.scope}</TableCell>
            <TableCell>{row.expires}</TableCell>
        </TableRow>
    )
}

export function headerData(header: {key: string;header: string;}){
    return(<TableHeader key={header.key}>{header.header}</TableHeader>)
}

export function CreateTokenTable({headers, rows}:
    {
        headers: {key: string;header: string;}[],
        rows: {id: string; tokenName: string; scope: string; expires: string;}[]
    }) {
    const header = headers.map(header => headerData(header));
    const row = rows.map(row => rowData(row));
  return (
    <Table size="lg" useZebraStyles={false}>
    <TableHead>
      <TableRow key='header'>
        {header}
      </TableRow>
    </TableHead>
    <TableBody>
        {row}
    </TableBody>
  </Table>
  );
};

export const TokenTable = dynamic(() => Promise.resolve(CreateTokenTable), {
  ssr: false,
});
