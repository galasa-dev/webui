/*
 * Copyright contributors to the Galasa project
 */
import PageHeader from '@/components/PageHeader';
import Sidebar from '@/components/Sidebar';
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
        {/* <Sidebar /> */}
        {children}
        </body>
    </html>
  );
}
