/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { ColumnDefinition } from '../interfaces';

const CLIENT_API_VERSION = '0.44.0';

const COLORS = {
  RED: '#da1e28',
  GREEN: '#24A148',
  NEUTRAL: '#6f6f6f',
  BLUE: '#0043ce',
  YELLOW: '#f1c21b',
  PURPLE: '#ab47bc',
  CYAN: '#00bcd4',
  GRAY: '#bdbdbd',
  BLUE_GRAY: '#607d8b',
};

const MAX_DISPLAYABLE_TEST_RUNS = 2000;

const NOTIFICATION_VISIBLE_MILLISECS = 6000;

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MONTHS = 3;

const TEST_RUNS_STATUS: Record<string, string> = {
  QUEUED: 'Queued',
  STARTED: 'Started',
  GENERATING: 'Generating',
  BUILDING: 'Building',
  PROVSTART: 'Provstart',
  RUNNING: 'Running',
  RUNDONE: 'Rundone',
  ENDING: 'Ending',
  FINISHED: 'Finished',
};

const COLUMNS_IDS = {
  SUBMITTED_AT: 'submittedAt',
  TEST_RUN_NAME: 'runName',
  REQUESTOR: 'requestor',
  SUBMISSION_ID: 'submissionId',
  GROUP: 'group',
  BUNDLE: 'bundle',
  PACKAGE: 'package',
  TEST_NAME: 'testName',
  TEST_SHORT_NAME: 'testShortName',
  STATUS: 'status',
  TAGS: 'tags',
  RESULT: 'result',
} as const;

const RESULTS_TABLE_COLUMNS: ColumnDefinition[] = [
  { id: 'submittedAt', columnName: 'Submitted at' },
  { id: 'runName', columnName: 'Test Run name' },
  { id: 'requestor', columnName: 'Requestor' },
  { id: 'submissionId', columnName: 'Submission ID' },
  { id: 'group', columnName: 'Group' },
  { id: 'bundle', columnName: 'Bundle' },
  { id: 'package', columnName: 'Package' },
  { id: 'testShortName', columnName: 'Test Name (short)' },
  { id: 'testName', columnName: 'Test Name (full)' },
  { id: 'status', columnName: 'Status' },
  { id: 'tags', columnName: 'Tags' },
  { id: 'result', columnName: 'Result' },
];

const TEST_RUNS_QUERY_PARAMS = {
  FROM: 'from',
  TO: 'to',
  DURATION: 'duration',
  RUN_NAME: 'runName',
  REQUESTOR: 'requestor',
  GROUP: 'group',
  BUNDLE: 'bundle',
  PACKAGE: 'package',
  TEST_SHORT_NAME: 'testShortName',
  TEST_NAME: 'testName',
  SUBMISSION_ID: 'submissionId',
  STATUS: 'status',
  RESULT: 'result',
  TAGS: 'tags',
  VISIBLE_COLUMNS: 'visibleColumns',
  COLUMNS_ORDER: 'columnsOrder',
  TAB: 'tab',
  SORT_ORDER: 'sortOrder',
  QUERY_NAME: 'queryName',
};

const SINGLE_RUN_QUERY_PARAMS = {
  TAB: 'tab',
  LOG_LINE: 'line',
} as const;

const TABS_IDS = ['timeframe', 'table-design', 'search-criteria', 'results', 'graph'];

// Keys that are managed by the SearchCriteriaContent component
const SEARCH_CRITERIA_KEYS = [
  TEST_RUNS_QUERY_PARAMS.RUN_NAME,
  TEST_RUNS_QUERY_PARAMS.REQUESTOR,
  TEST_RUNS_QUERY_PARAMS.GROUP,
  TEST_RUNS_QUERY_PARAMS.SUBMISSION_ID,
  TEST_RUNS_QUERY_PARAMS.BUNDLE,
  TEST_RUNS_QUERY_PARAMS.TEST_NAME,
  TEST_RUNS_QUERY_PARAMS.RESULT,
  TEST_RUNS_QUERY_PARAMS.STATUS,
  TEST_RUNS_QUERY_PARAMS.TAGS,
];

const DEFAULT_VISIBLE_COLUMNS: string[] = [
  COLUMNS_IDS.SUBMITTED_AT,
  COLUMNS_IDS.TEST_RUN_NAME,
  COLUMNS_IDS.REQUESTOR,
  COLUMNS_IDS.TEST_SHORT_NAME,
  COLUMNS_IDS.STATUS,
  COLUMNS_IDS.RESULT,
];

const BATCH_SIZE = 100;

// NOTE: To add a new locale, you need to:
// 1. Add the locale code to the SUPPORTED_LOCALES array below.
// 2. Add the locale's flatpickr date format to the LOCALE_TO_FLATPICKR_FORMAT_MAP object.
const SUPPORTED_LOCALES = [
  { code: 'en-US', format: 'MM/DD/YYYY' },
  { code: 'en-GB', format: 'DD/MM/YYYY' },
  { code: 'fr-FR', format: 'DD/MM/YYYY' },
  { code: 'de-DE', format: 'DD.MM.YYYY' },
];

// Converts a display format string to a Flatpickr-compatible format used by the DatePicker component.
const LOCALE_TO_FLATPICKR_FORMAT_MAP: { [key: string]: string } = {
  'en-US': 'm/d/Y',
  'en-GB': 'd/m/Y',
  'fr-FR': 'd/m/Y',
  'de-DE': 'd.m.Y',
};

const TIME_FORMATS = [
  { label: '12-hour', format: 'hh:mm:ss AM/PM' },
  { label: '24-hour', format: 'HH:mm:ss' },
];

const PREFERENCE_KEYS = {
  DATE_TIME_FORMAT_TYPE: 'dateTimeFormatType' as const,
  LOCALE: 'locale' as const,
  TIME_FORMAT: 'timeFormat' as const,
  TIME_ZONE_TYPE: 'timeZoneType' as const,
  TIME_ZONE: 'timeZone' as const,
} as const;

const TEST_RUN_PAGE_TABS = ['overview', 'methods', 'runLog', 'artifacts'];

const DEFAULT_QUERY = {
  // The URL here is the filter state, not the browser URL
  url: '',
  title: 'Tests ran in the last 24 hours',
  createdAt: new Date().toISOString(),
};

const RESULTS_TABLE_PAGE_SIZES = [10, 20, 30, 40, 50];


export {
  CLIENT_API_VERSION,
  COLORS,
  MAX_DISPLAYABLE_TEST_RUNS,
  NOTIFICATION_VISIBLE_MILLISECS,
  MINUTE_MS,
  HOUR_MS,
  DAY_MS,
  MAX_RANGE_MONTHS,
  TEST_RUNS_STATUS,
  BATCH_SIZE,
  RESULTS_TABLE_COLUMNS,
  COLUMNS_IDS,
  TEST_RUNS_QUERY_PARAMS,
  TABS_IDS,
  SEARCH_CRITERIA_KEYS,
  DEFAULT_VISIBLE_COLUMNS,
  SUPPORTED_LOCALES,
  TIME_FORMATS,
  PREFERENCE_KEYS,
  TEST_RUN_PAGE_TABS,
  SINGLE_RUN_QUERY_PARAMS,
  LOCALE_TO_FLATPICKR_FORMAT_MAP,
  DEFAULT_QUERY,
  RESULTS_TABLE_PAGE_SIZES,
};
