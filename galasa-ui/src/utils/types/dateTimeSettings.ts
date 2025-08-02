/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

export type DateTimeFormats = 'custom' | 'browser'
export type TimeZoneFormats = 'custom' | 'browser'
export type Locale = { code: string; format: string; example: string };
export type TimeFormat = { label: string; format: string };
export type TimeZone = { iana: string; label: string; };