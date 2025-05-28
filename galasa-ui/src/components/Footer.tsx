/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

"use client";

import React, { useEffect, useState } from 'react';
import styles from "@/styles/Footer.module.css";
import { Theme } from '@carbon/react';

interface FooterProps {
  serviceHealthyPromise: Promise<boolean>;
  clientVersionPromise?: Promise<string | undefined>;
}

const Footer = ({ serviceHealthyPromise, clientVersionPromise }: FooterProps) => {

  const [isHealthOk, setIsHealthOk] = useState(true);
  const [apiVersion, setApiVersion] = useState("");


  useEffect(() => {
    const checkServiceHealth = async () => {
      const isPingSuccessful = await serviceHealthyPromise;
      setIsHealthOk(isPingSuccessful);
    };

    const getApiVersion = async () => {
      const apiVersion = await clientVersionPromise;
      if (apiVersion) {
        setApiVersion(apiVersion);
      }
    };

    checkServiceHealth();
    getApiVersion();

  }, [serviceHealthyPromise, clientVersionPromise]); // included these to satisfy React Hook linting – their identity is stable so the effect still only runs once

  return (
    <Theme theme="g90">
      <footer className={styles.footer} role="footer">
        {
          isHealthOk && <p>Galasa version {apiVersion}</p>
        }
        <p className={styles.serviceHealthTitle}>Service health</p>
        { isHealthOk ? <div className={styles.healthy} /> : <div className={styles.error} /> }
      </footer>
    </Theme>
  );
};

export default Footer;