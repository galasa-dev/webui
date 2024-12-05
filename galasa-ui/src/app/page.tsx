/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import HomeContent from '@/components/HomeContent';
import PageTile from '@/components/PageTile';


export default function HomePage() {
  return (
    <div id="content">
      <PageTile data-testid="page-tile" title={"Home"} />
      <HomeContent />
    </div>
  );
};
