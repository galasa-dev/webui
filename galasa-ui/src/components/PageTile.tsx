/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { Tile } from '@carbon/react';
import "../styles/global.scss";

export default function PageTile({ title }: { title: String }) {

  return (
    <Tile id="tile">
      {title}
    </Tile>
  );

}