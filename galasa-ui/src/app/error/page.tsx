/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { useTranslations } from 'next-intl';

export default function ErrorPage() {
  const translations = useTranslations('ErrorPage');
  return (
    <div className="center">
      <h1>{translations('errorTitle')}</h1>
      <p className="margin-top-1">{translations('errorDescription')}</p>
    </div>
  );
}
