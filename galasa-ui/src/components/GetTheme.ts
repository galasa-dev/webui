/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { useTheme } from '@/contexts/ThemeContext';

export function GetTheme() {
  const current = useTheme().theme;
  if (current === 'system') {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    } else {
      return 'light';
    }
  } else {
    return current;
  }
}
