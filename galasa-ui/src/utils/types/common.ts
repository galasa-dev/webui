/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TranslationValues } from 'next-intl';

export type AmPm = 'AM' | 'PM';
export type sortOrderType = 'asc' | 'desc' | 'none';

export type NotificationType = {
  kind: 'error' | 'success' | 'info' | 'warning';
  title: string;
  subtitle: string;
};

export type SavedQueryType = {
  title: string;
  url: string;
  createdAt: string;
  isActive?: boolean;
};

export type SavedQueriesMetaData = {
  defaultQueryId: string | null;
};

export type TranslationFn = (key: string, values?: TranslationValues) => string;
