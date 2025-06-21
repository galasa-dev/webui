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

const MAX_RECORDS = 1000; // Maximum number of records to fetch in one go

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const MAX_RANGE_MONTHS = 3;

export { CLIENT_API_VERSION,COLORS, MAX_RECORDS, MINUTE_MS, HOUR_MS, DAY_MS, MAX_RANGE_MONTHS };

