/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import PageHeader from '@/components/PageHeader';
import '../styles/global.scss';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Galasa Ecosystem</title>
        <meta name="description" content="Galasa Ecosystem Web UI"/>
      </head>
      <body>
        <PageHeader />
        {children}
        </body>
    </html>
  );
}
