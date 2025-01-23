/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Header, HeaderName, SkipToContent, Theme } from '@carbon/react';
import PageHeaderMenu from "./PageHeaderMenu";
import LeftHeaderMenu from './LeftHeaderMenu';

export default function PageHeader({ galasaServiceName }: { galasaServiceName: string }) {

  return (
    <Theme theme="g90">
      <Header aria-label="Galasa Ecosystem">

        <SkipToContent />

        <LeftHeaderMenu />

        <HeaderName prefix="">{galasaServiceName}</HeaderName>

        <PageHeaderMenu />

      </Header>
    </Theme>
  );

};