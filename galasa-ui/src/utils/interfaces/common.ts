/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

/**
 * Common interfaces used across multiple components and utilities
 */

export interface MarkdownResponse {
  markdownContent: string;
  responseStatusCode: number;
}

export type AmPm = 'AM' | 'PM';
export type sortOrderType = 'asc' | 'desc' | 'none';

// DataTableHeader, DataTableCell, DataTableRow are IBM Carbon interfaces
export interface DataTableHeader {
  key: string;
  header: string;
}

export interface DataTableCell {
  id: string;
  value: string;
  isEditable: boolean;
  isEditing: boolean;
  isValid: boolean;
  errors: null | Array<any>;
  info: {
    header: string;
  };
}

export interface DataTableRow {
  id: string;
  cells: DataTableCell[];
  disabled?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
}
