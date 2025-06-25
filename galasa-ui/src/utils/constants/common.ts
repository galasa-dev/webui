/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

const CLIENT_API_VERSION = "0.43.0";

const COLORS = {

  RED: "#da1e28",
  GREEN: "#24A148",
  NEUTRAL: "#6f6f6f",
  BLUE: "#0043ce",
  YELLOW: "#f1c21b"

};

// Maximum number of records to fetch in one go
const MAX_RECORDS = 1000; 

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MONTHS = 3;

const TEST_RUNS_STATUS = ['Finished', 'Building', 'Generating', 'Running', 'Rundone',
  'Up', 'Started', 'Provstart', 'Ending'];
  
const BATCH_SIZE = 100;
export { CLIENT_API_VERSION,COLORS, MAX_RECORDS, MINUTE_MS, HOUR_MS, DAY_MS, MAX_RANGE_MONTHS, TEST_RUNS_STATUS, BATCH_SIZE };
