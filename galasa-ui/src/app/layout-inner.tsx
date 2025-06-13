import { getClientApiVersion, getServiceHealthStatus } from '@/utils/health';
import Footer from '@/components/Footer';
import PageHeader from '@/components/headers/PageHeader';
import { FeatureFlagProvider } from '@/contexts/FeatureFlagContext';

export default function RootLayoutInner({
  children,
  galasaServiceName,
  featureFlagsCookie,
  locale
}: {
  children: React.ReactNode;
  galasaServiceName: string;
  featureFlagsCookie?: string;
  locale?: string;
}) {
  return (
    <html lang={locale || 'en'}>
      <head>
        <title>{galasaServiceName}</title>
        <meta name="description" content="Galasa Ecosystem Web UI" />
      </head>
      <body>
        <FeatureFlagProvider initialFlags={featureFlagsCookie}>
          <PageHeader galasaServiceName={galasaServiceName} />
          {children}
          <Footer
            serviceHealthyPromise={getServiceHealthStatus()}
            clientVersionPromise={getClientApiVersion()}
          />
        </FeatureFlagProvider>
      </body>
    </html>
  );
}