/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TimeZone } from "../types/dateTimeSettings";

export const SUPPORTED_TIMEZONES: TimeZone[] = [
  // --- Core & Reference ---
  { iana: 'UTC', label: '(UTC+00:00) Coordinated Universal Time' },

  // --- Americas ---
  { iana: 'America/New_York', label: '(UTC-05:00) Eastern Time (New York)' },
  { iana: 'America/Chicago', label: '(UTC-06:00) Central Time (Chicago)' },
  { iana: 'America/Denver', label: '(UTC-07:00) Mountain Time (Denver)' },
  { iana: 'America/Los_Angeles', label: '(UTC-08:00) Pacific Time (Los Angeles)' },
  { iana: 'America/Anchorage', label: '(UTC-09:00) Alaska Time (Anchorage)' },
  { iana: 'America/Honolulu', label: '(UTC-10:00) Hawaii Time (Honolulu)' },
  { iana: 'America/Sao_Paulo', label: '(UTC-03:00) São Paulo' },
  { iana: 'America/Argentina/Buenos_Aires', label: '(UTC-03:00) Buenos Aires' },

  // --- Europe, Middle East & Africa ---
  { iana: 'Europe/London', label: '(UTC+00:00) London, Dublin (GMT/BST)' },
  { iana: 'Europe/Berlin', label: '(UTC+01:00) Central European Time (Berlin, Paris)' },
  { iana: 'Europe/Moscow', label: '(UTC+03:00) Moscow' },
  { iana: 'Africa/Cairo', label: '(UTC+02:00) Cairo' },
  { iana: 'Africa/Johannesburg', label: '(UTC+02:00) Johannesburg' },
  { iana: 'Asia/Dubai', label: '(UTC+04:00) Dubai' },

  // --- Asia-Pacific ---
  { iana: 'Asia/Kolkata', label: '(UTC+05:30) India Standard Time (Kolkata, Mumbai)' },
  { iana: 'Asia/Shanghai', label: '(UTC+08:00) China Standard Time (Shanghai, Beijing)' },
  { iana: 'Asia/Tokyo', label: '(UTC+09:00) Japan Standard Time (Tokyo)' },
  { iana: 'Australia/Sydney', label: '(UTC+10:00) AEST (Sydney)' },
  { iana: 'Australia/Perth', label: '(UTC+08:00) AWST (Perth)' },
  { iana: 'Pacific/Auckland', label: '(UTC+12:00) Auckland' },
];