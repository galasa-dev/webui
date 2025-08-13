/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export type AmPm = 'AM' | 'PM';
export type sortOrderType = 'asc' | 'desc' | 'none';

export type NotificationType = {
  kind: 'error' | 'success' | 'info' | 'warning';
  title: string;
  subtitle: string;
};

export type SavedQueryType = {
  createdAt: string;
  title: string;
  url: string;
};
