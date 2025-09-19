/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import React from 'react'
import { useRouter, usePathname } from 'next/navigation';
import { DropdownOption } from '@/utils/interfaces/3270Terminal';
import { encodeStateToUrlParam } from '@/utils/urlEncoder';

export function handleURL(terminalID: string, searchTerm: string, selectedTerminal: DropdownOption | null): void {
  const router = useRouter();
  const pathname = usePathname();

  const encoded3270filterParams = encodeStateToUrlParam(params.toString());

  router.replace(`${pathname}?q=${encoded3270filterParams}`);
}