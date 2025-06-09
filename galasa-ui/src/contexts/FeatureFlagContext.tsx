/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import FeatureFlagCookies from '@/utils/featureFlagCookies';
import { DEFAULT_FEATURE_FLAGS } from '@/utils/featureFlags';

type FeatureFlags = {
  [K in keyof typeof DEFAULT_FEATURE_FLAGS]: boolean;
};
type FeatureFlagKey = keyof FeatureFlags;

type FeatureFlagContextType = {
    isFeatureEnabled: (feature: FeatureFlagKey) => boolean;
    toggleFeatureFlag: (feature: FeatureFlagKey) => void;
};

type ProviderProps = {
    children: ReactNode;
    initialFlags?: string;
}

export const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);


/**
 * Custom React hook to access feature flag utilities.
 * 
 * This hook provides access to the current feature flag state and toggle function
 * from anywhere within the component tree wrapped by FeatureFlagProvider.
 * 
 * Usage:
 *   const { isFeatureEnabled, toggleFeatureFlag } = useFeatureFlags();
 * 
 * - isFeatureEnabled(feature): Returns true if the given feature is enabled.
 * - toggleFeatureFlag(feature): Toggles the enabled/disabled state of the feature.
 * 
 */
export const useFeatureFlags = (): FeatureFlagContextType => {
  const context = useContext(FeatureFlagContext);
  if (!context) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
};


/**
 * Provider component for managing feature flags.
 * 
 * This component initializes feature flags from cookies or initial props,
 * provides a context for accessing feature flag utilities, and updates cookies
 * whenever feature flags change.
 * 
 * Usage:
 *   <FeatureFlagProvider initialFlags={JSON.stringify({ featureKey: true })}>
 *     <YourComponent />
 *   </FeatureFlagProvider>
 * 
 * - initialFlags: Optional JSON string to initialize feature flags.
 */
export const FeatureFlagProvider = ({ children, initialFlags }: ProviderProps) => {
  // Initialize feature flags state with default values or from the initialFlags prop
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags>(() => {
    let currentFeatureFlags: FeatureFlags = DEFAULT_FEATURE_FLAGS;
    if (initialFlags) {
      try {
        const parsedFlags = JSON.parse(initialFlags);
        currentFeatureFlags = { ...DEFAULT_FEATURE_FLAGS, ...parsedFlags };
      } catch (error) {
        console.error('Error parsing initial feature flags:', error);
      }
    }
    return currentFeatureFlags;
  });


  // Save feature flags to the cookie whenever they change
  useEffect(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1); // Set expiry for 1 year
    const expires = `expires=${date.toUTCString()}`;
      
    document.cookie = `${FeatureFlagCookies.FEATURE_FLAGS}=${JSON.stringify(featureFlags)};${expires};path=/`;
  }, [featureFlags]);

  const toggleFeatureFlag = (feature: FeatureFlagKey) => {
    setFeatureFlags(prevFlags => ({
      ...prevFlags,
      [feature]: !prevFlags[feature]
    }));
  };
    

  const isFeatureEnabled = (feature: FeatureFlagKey): boolean => {
    return featureFlags[feature] ?? false; 
  };


  return (
    <FeatureFlagContext.Provider value={{ isFeatureEnabled, toggleFeatureFlag}}>
      {children}
    </FeatureFlagContext.Provider>
  );
};