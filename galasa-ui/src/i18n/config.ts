/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
export type Locale = (typeof locales)[number];

export const locales = ['en', 'de'] as const;
export const defaultLocale: Locale = 'en';