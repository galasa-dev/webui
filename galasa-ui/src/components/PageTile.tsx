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
}: {
  translationKey: string;
}) {
  const translations = useTranslations();

  return <Tile id="tile">{translations(translationKey)}</Tile>;
}
