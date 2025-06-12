'use client';

import { useTranslations } from 'next-intl';
import PageTile from './PageTile';

export default function PageTileClient({ translationKey }: { translationKey: string }) {
  const t = useTranslations();
  return <PageTile title={t(translationKey)} />;
}
