/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { TranslationValues } from 'next-intl';
import { TranslationFn } from '../types/common';

/**
 * Function to get the translation for a given key, and if not found, return the key itself.
 *
 * @param key - The key to be translated
 * @param translations - The translations function
 * @param fileName - The name of the translation file. This should be the exact same as the namespace used in useTranslations hook
 *
 * @returns The translated string or the key if translation is not found
 */
export const getTranslation = (
  key: string,
  filename: string,
  translations: TranslationFn,
  values?: TranslationValues
) => {
  const translated = translations(key, { ...values });

  // Check if translation is missing (usually returns namespace.key format when missing)
  const isMissingTranslation = translated === `${filename}.${key}` || translated === key;

  return isMissingTranslation ? key : translated;
};
