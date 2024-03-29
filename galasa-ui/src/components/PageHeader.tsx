/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Header, HeaderName , SkipToContent} from '@carbon/react';

export default function PageHeader() {
  return (
    <Header aria-label="Galasa Ecosystem">
      <SkipToContent />
      <HeaderName prefix="">Galasa Ecosystem</HeaderName>
    </Header>
  );
};