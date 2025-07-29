/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TimeZone } from "../types/dateTimeSettings";

export const SUPPORTED_TIMEZONES: TimeZone[] = [
  // --- Core & Reference ---
  { iana: 'UTC', label: 'Coordinated Universal Time (UTC)' },

  // --- UK & Ireland ---
  { iana: 'Europe/London', label: 'UK Time (London)' },

  // --- Americas ---
  { iana: 'America/New_York', label: 'Eastern Time (New York)' },
  { iana: 'America/Chicago', label: 'Central Time (Chicago)' },
  { iana: 'America/Denver', label: 'Mountain Time (Denver)' },
  { iana: 'America/Los_Angeles', label: 'Pacific Time (Los Angeles)' },
  { iana: 'America/Anchorage', label: 'Alaska Time (Anchorage)' },
  { iana: 'America/Sao_Paulo', label: 'São Paulo Time' },
  { iana: 'America/Argentina/Buenos_Aires', label: 'Argentina Time (Buenos Aires)' },

  // --- Europe, Middle East & Africa ---
  { iana: 'Europe/Berlin', label: 'Central European Time (Berlin, Paris)' },
  { iana: 'Europe/Moscow', label: 'Moscow Standard Time' },
  { iana: 'Africa/Cairo', label: 'Egypt Time (Cairo)' },
  { iana: 'Africa/Johannesburg', label: 'South Africa Standard Time' },
  { iana: 'Asia/Dubai', label: 'Gulf Standard Time' },

  // --- Asia-Pacific ---
  { iana: 'Asia/Kolkata', label: 'India Standard Time' },
  { iana: 'Asia/Shanghai', label: 'China Standard Time' },
  { iana: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { iana: 'Australia/Sydney', label: 'Australian Eastern Time' },
  { iana: 'Australia/Perth', label: 'Australian Western Time' },
  { iana: 'Pacific/Auckland', label: 'New Zealand Time (Auckland)' },
];