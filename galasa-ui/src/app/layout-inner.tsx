/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { getClientApiVersion, getServiceHealthStatus } from "@/utils/health";
import Footer from "@/components/Footer";
import PageHeader from "@/components/headers/PageHeader";
import { FeatureFlagProvider } from "@/contexts/FeatureFlagContext";

export default function RootLayoutInner({
  children,
  galasaServiceName,
  featureFlagsCookie,
}: {
  children: React.ReactNode;
  galasaServiceName: string;
  featureFlagsCookie?: string;
}) {
  return (
    <>
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
    </>
  );
}
