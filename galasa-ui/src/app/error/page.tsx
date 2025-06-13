import { useTranslations } from "next-intl";

/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
export default function ErrorPage() {
  const t = useTranslations('ErrorPage');
  return (
    <div className="center">
      <h1>{t('errorTitle')}</h1>
      <p className="margin-top-1">{t('errorDescription')}</p>
    </div>
  );
}
