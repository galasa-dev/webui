/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { SavedQueryType } from '@/utils/types/common';
import { useState } from 'react';

export default function useSavedQueries() {
  const [savedQueries, setSavedQueries] = useState<SavedQueryType[]>([]);

  return {
    savedQueries,
    setSavedQueries,
  };
}
