/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { headerData, rowData ,CreateTokenTable} from '@/components/Table';
import { TableRow, TableCell, TableHeader } from '@carbon/react';
import { render, screen } from '@testing-library/react';

test('renders Galasa Token Table', () => {
  const headers = [
    {key: 'tokenName',header: 'Token'},
    {key: 'scope',header: 'Scope'},
    {key: 'expires',header: 'Expires'}
  ];

  const rows = [
    {id: '1234', tokenName: 'tkn1Example', scope: 'ALL', expires: '2023-10-22'},
    {id: '5678', tokenName: 'tkn2Example', scope: 'Local', expires: '2023-09-31'}
  ];
  render(<CreateTokenTable headers={headers} rows={rows} />);
  const headerToken = screen.getByText(/Token/i);
  const headerScope = screen.getByText(/Scope/i);
  const row1TokenName = screen.getByText(/tkn1Example/i);
  const row2TokenName = screen.getByText(/tkn2Example/i);
  expect(headerToken).toBeInTheDocument();
  expect(headerScope).toBeInTheDocument();
  expect(row1TokenName).toBeInTheDocument();
  expect(row2TokenName).toBeInTheDocument();
});


test('creates Galasa Token Table header', () => {
  const header = {key: 'tokenName',header: 'Token'};
  const headerToken = headerData(header);
  const expectedToken = <TableHeader key='tokenName'>Token</TableHeader>;
  expect(headerToken).toEqual(expectedToken);
});

test('creates Galasa Token Table headers', () => {
  const headers = [{key: 'tokenName',header: 'Token'},{key: 'scope',header: 'scope'}];
  const headerToken = headers.map(header => headerData(header));
  const expectedToken = <TableHeader key='tokenName'>Token</TableHeader>;
  const expectedscope = <TableHeader key='scope'>scope</TableHeader>;
  expect(headerToken[0]).toEqual(expectedToken);
  expect(headerToken[1]).toEqual(expectedscope);
});

test('creates Galasa Token Table row', () => {
  const row = {id: '4321', tokenName: 'Token1Example', scope: 'ALL', expires: '2023-10-22'};
  const rowReturned = rowData(row);
  const expectedRow = <TableRow key='4321'>
    <TableCell>Token1Example</TableCell>
    <TableCell>ALL</TableCell>
    <TableCell>2023-10-22</TableCell>
  </TableRow>;
  expect(rowReturned).toEqual(expectedRow);
});

test('creates Galasa Token Table row', () => {
  const rows = [{id: '4321', tokenName: 'Token1Example', scope: 'ALL', expires: '2023-10-22'},{id: '5678', tokenName: 'Token2Example', scope: 'Local', expires: '2023-09-10'}];
  const rowReturned = rows.map(header => rowData(header));
  const expectedToken1 = <TableRow key='4321'><TableCell>Token1Example</TableCell><TableCell>ALL</TableCell><TableCell>2023-10-22</TableCell></TableRow>;
  const expectedToken2 = <TableRow key='5678'><TableCell>Token2Example</TableCell><TableCell>Local</TableCell><TableCell>2023-09-10</TableCell></TableRow>;
  expect(rowReturned[0]).toEqual(expectedToken1);
  expect(rowReturned[1]).toEqual(expectedToken2);
});