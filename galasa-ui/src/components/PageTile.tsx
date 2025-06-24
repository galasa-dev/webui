/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { Tile } from '@carbon/react';
import "@/styles/global.scss";
import { useTranslations } from "next-intl";
import { Theme } from '@carbon/react'; // Ensure this is the correct library for Theme
import { useTheme } from '@carbon/react';

export default function PageTile({
  translationKey,
}: {
  translationKey: string;
}) {
  const translations = useTranslations();
  const theme = useTheme();

  return(
    <Theme theme={theme}>
      <Tile id="tile">{translations(translationKey)}</Tile>
    </Theme>
  );
}
