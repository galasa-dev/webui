/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { useTransition } from 'react';
import { ThemeType, useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Laptop } from '@carbon/icons-react';
import { HeaderGlobalAction } from '@carbon/react';

const themeOptions: { id: ThemeType; label: string; icon: React.ReactNode; tooltip: string }[] = [
  { id: 'light', label: 'Light', icon: <Sun size={20} />, tooltip: 'Switch to light mode' },
  { id: 'dark', label: 'Dark', icon: <Moon size={20} />, tooltip: 'Switch to dark mode' },
  {
    id: 'system',
    label: 'System',
    icon: <Laptop size={20} />,
    tooltip: 'Switch to system preference',
  },
];

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [, startTransition] = useTransition();
  const idx = themeOptions.findIndex((o) => o.id === theme);
  const currentTheme = themeOptions[idx] || themeOptions[0];
  const next = themeOptions[(idx + 1) % themeOptions.length];

  const cycleTheme = () => {
    startTransition(() => {
      setTheme(next.id);
    });
  };

  return (
    <HeaderGlobalAction
      data-floating-menu-container
      aria-label={next.tooltip}
      tooltipAlignment="center"
      tooltipPosition="bottom"
      onClick={cycleTheme}
    >
      {currentTheme.icon}
    </HeaderGlobalAction>
  );
}
