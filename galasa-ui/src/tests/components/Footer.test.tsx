/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import Footer from '@/components/Footer';
import { act, render, screen, waitFor } from '@testing-library/react';
import styles from "@/styles/Footer.module.css";

jest.mock('@/utils/health', () => ({
  getServiceHealthStatus: jest.fn(),
  getClientApiVersion:     jest.fn(),
}));

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, vars?: { version?: string }) => {
    const translations: Record<string, string | ((vars?: { version?: string }) => string)> = {
      versionText: (vars) => `Galasa version ${vars?.version ?? ''}`,
      health: "Service health"
    };

    const value = translations[key];
    if (typeof value === "function") {
      return value(vars);
    }
    return value || key;
  }
}));


test('renders the footer', async () => {

  const isGalasaServiceHealthy: boolean = true;
  const clientApiVersion: string = "0.40.0";

  const serviceHealthyPromise: Promise<boolean> = Promise.resolve(isGalasaServiceHealthy);
  const clientApiVersionPromise: Promise<string> = Promise.resolve(clientApiVersion);

  await act(async () => {
    return render(<Footer serviceHealthyPromise={serviceHealthyPromise} clientVersionPromise={clientApiVersionPromise}/>);
  });

  const footer = screen.getByRole('footer');
  expect(footer).toBeInTheDocument();
  
});

test('renders the footer with matching client api version', async () => {

  const isGalasaServiceHealthy: boolean = true;
  const clientApiVersion: string = "0.37.0";

  const serviceHealthyPromise: Promise<boolean> = Promise.resolve(isGalasaServiceHealthy);
  const clientApiVersionPromise: Promise<string> = Promise.resolve(clientApiVersion);

  const {container} = await act(async () => {
    return render(<Footer serviceHealthyPromise={serviceHealthyPromise} clientVersionPromise={clientApiVersionPromise}/>);
  });

  const version = await screen.findByText('Galasa version 0.37.0');
  expect(version).toBeInTheDocument();

  //Check the correct color div was rendered -> should render green dot
  expect(container.querySelector(`.${styles.healthy}`)).toBeInTheDocument();
  expect(container.querySelector(`.${styles.error}`)).not.toBeInTheDocument();

});

test('renders the footer with bad service health', async () => {

  const isGalasaServiceHealthy: boolean = false;
  const clientApiVersion: string = "0.37.0";

  const serviceHealthyPromise: Promise<boolean> = Promise.resolve(isGalasaServiceHealthy);
  const clientApiVersionPromise: Promise<string> = Promise.resolve(clientApiVersion);

  const {container} = await act(async () => {
    return render(<Footer serviceHealthyPromise={serviceHealthyPromise} clientVersionPromise={clientApiVersionPromise}/>);
  });

  //Dont render version if the service is bad
  await waitFor(() => {
    expect(screen.queryByText("Galasa Version")).toBeNull();
  });

  //Check the correct color div was rendered -> should render red dot
  expect(container.querySelector(`.${styles.healthy}`)).not.toBeInTheDocument();
  expect(container.querySelector(`.${styles.error}`)).toBeInTheDocument();
});