/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { Tile } from '@carbon/react';
import "@/styles/global.scss";
import { useTranslations } from "next-intl";

export default function PageTile({
  translationKey,
  className,
  children,
}: {
  translationKey: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const translations = useTranslations();

  return (
    <Tile id="tile" className={className}>
      {translations(translationKey)}
      {children}
    </Tile>
  );
}