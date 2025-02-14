/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import { UserData } from '@/generated/galasaapi';
import React, { useEffect, useState } from 'react';
import { Loading, Button, DataTable } from "@carbon/react";
import { Table, TableHead, TableRow, TableBody, TableCell, TableHeader, TableContainer, TableToolbarSearch, TableToolbarContent } from '@carbon/react';
import ErrorPage from '@/app/error/page';
import { TableRowProps } from '@carbon/react/lib/components/DataTable/TableRow';
import { TableHeadProps } from '@carbon/react/lib/components/DataTable/TableHead';
import { TableBodyProps } from '@carbon/react/lib/components/DataTable/TableBody';
import { Edit } from '@carbon/icons-react';
import styles from "@/styles/UsersList.module.css";
import Link from 'next/link';

export const dynamic = "force-dynamic";

type UsersListPromiseType = Promise<UserData[]>;
type CurrentUserPromiseType = Promise<UserData>;

interface UsersTableProps {
  usersListPromise: UsersListPromiseType;
  currentUserPromise: CurrentUserPromiseType;
}

// DataTableHeader, DataTableCell, DataTableRow are IBM Carbon interfaces
interface DataTableHeader {
  key: string,
  header: string
}

interface DataTableCell {
  id: string;
  value: string;
  isEditable: boolean;
  isEditing: boolean;
  isValid: boolean;
  errors: null | Array<Error>;
  info: {
    header: string;
  };
}

interface DataTableRow {
  id: string;
  cells: DataTableCell[];
  disabled?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
}

export default function UsersTable({ usersListPromise, currentUserPromise }: UsersTableProps) {

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [hasEditUserPermission, setHasEditUserPermission] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserData>({});
  const EDIT_OTHER_USERS_PERMISSION = "USER_EDIT_OTHER";

  const headers = [

    // headers we want to show in the data table
    // keys should match with the prop name in the interface

    {
      key: "loginId",
      header: "Login ID"
    },
    {
      key: "role",
      header: "Role"
    },
    {
      key: "lastLogin",
      header: "Last login"
    },
    {
      key: "lastAccessTokenUse",
      header: "Last access token use"
    },
  ];

  const flattenUserDataForTable = (users: UserData[]) => {
    return users.map((user) => {


      let formattedLastLogin = "n/a";
      let formattedLastAccessTokenUse = "n/a";

      if (user.clients && user.clients.length > 0) {
        // Find the client with clientName "web-ui" that also has a lastLogin value.
        const webClient = user.clients.find(
          (client) => client.clientName === "web-ui" && client.lastLogin
        );

        // Find the client with clientName "rest-api" that also has a lastLogin value.
        const restApiClient = user.clients.find(
          (client) => client.clientName === "rest-api" && client.lastLogin
        );

        // Format the dates if the clients were found.
        if (webClient) {
          formattedLastLogin = new Intl.DateTimeFormat("en-GB").format(
            webClient.lastLogin
          );
        }

        if (restApiClient) {
          formattedLastAccessTokenUse = new Intl.DateTimeFormat("en-GB").format(
            restApiClient.lastLogin
          );
        }
      }

      // Return an object for each user with the desired properties.
      return {
        id: user.id,
        loginId: user.loginId,
        role: user.synthetic?.role?.metadata?.name || "n/a",
        lastLogin: formattedLastLogin,
        lastAccessTokenUse: formattedLastAccessTokenUse,
      };
    });
  };

  const checkForEditUsersPermission = async () => {

    const user = await currentUserPromise;
    const userPermissions = user.synthetic?.role?.data?.actions;
    setCurrentUser(user);

    if (userPermissions && userPermissions.length > 0) {

      const isAllowed = userPermissions.includes(EDIT_OTHER_USERS_PERMISSION);
      setHasEditUserPermission(isAllowed);

    }

  };

  useEffect(() => {

    const loadUsers = async () => {

      setIsLoading(true);

      try {

        const users = await usersListPromise;
        if (users) {
          let flattenedUsers = await flattenUserDataForTable(users);
          setUsers(flattenedUsers);
        }

      } catch (err) {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }

    };

    loadUsers();
    checkForEditUsersPermission();

  }, [usersListPromise]);

  if (isError) {
    return <ErrorPage />;
  }

  if (isLoading) {
    return <Loading small={false} active={isLoading}/>;
  }

  return (
    <div className={styles.userListContainer}>

      <DataTable isSortable rows={users} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          onInputChange
        }: {
          rows: DataTableRow[];
          headers: DataTableHeader[];
          getHeaderProps: (options: any) => TableHeadProps;
          getRowProps: (options: any) => TableRowProps;
          getTableProps: () => TableBodyProps;
          onInputChange: (evt: React.ChangeEvent<HTMLImageElement>) => void;
        }) => (
          <TableContainer>
            <TableToolbarContent>
              <TableToolbarSearch placeholder="Search" persistent onChange={onInputChange} />
            </TableToolbarContent>
            <Table {...getTableProps()} aria-label="users table" size="lg">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  {hasEditUserPermission && <TableHeader aria-label="user actions" />}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      {row.cells.map((cell: DataTableCell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))
                      }
                      {
                        // Only display edit button if user has the relevant action / permission
                        hasEditUserPermission &&
                        <TableCell className="cds--table-column-menu">
                          <Link href={{pathname: currentUser.loginId === row.cells[0].value ? "/mysettings" : "/users/edit", query: {loginId: row.cells[0].value}}}>
                            <Button renderIcon={Edit} hasIconOnly kind="ghost" iconDescription="Edit User" />
                          </Link>
                        </TableCell>
                      }
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

    </div>
  );
}
