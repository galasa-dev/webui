/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import PageHeader from '@/components/headers/PageHeader';
import '@/styles/global.scss';

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const galasaServiceName = process.env.GALASA_SERVICE_NAME?.trim() || "Galasa Service";

  return (
    <html lang="en">
      <head>
        <title>{galasaServiceName}</title>
        <meta name="description" content="Galasa Ecosystem Web UI" />
      </head>
      <body>
        <PageHeader galasaServiceName={galasaServiceName} />
        {children}
      </body>
    </html>
  );
}
