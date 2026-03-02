/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { render, screen, fireEvent } from '@testing-library/react';
import ExperimentalFeaturesSection from '@/components/mysettings/ExperimentalFeaturesSection';
import { FeatureFlagContext } from '@/contexts/FeatureFlagContext';
import { FEATURE_FLAGS } from '@/utils/featureFlags';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Experimental Features',
      description:
        'Early access to new features. These are experimental and subject to change or removal.',
      'features.testRunSearch': 'Test Run searching and viewing',
    };
    return translations[key] || key;
  },
}));

describe('ExperimentalFeaturesSection', () => {
  test('Renders correctly when "testRuns" flag is disabled: Checkbox is unchecked', () => {
    const mockIsFeatureEnabled = (key: string) => key !== FEATURE_FLAGS.TEST_RUNS;

    render(
      <FeatureFlagContext.Provider
        value={{ isFeatureEnabled: mockIsFeatureEnabled, toggleFeatureFlag: jest.fn() }}
      >
        <ExperimentalFeaturesSection />
      </FeatureFlagContext.Provider>
    );

    const checkbox = screen.getByLabelText(/Test Run/i);
    expect(checkbox).not.toBeChecked();
  });

  test('Renders correctly when a "testRuns" enabled: Checkbox is checked', () => {
    const mockIsFeatureEnabled = (key: string) => {
      return key === FEATURE_FLAGS.TEST_RUNS;
    };

    render(
      <FeatureFlagContext.Provider
        value={{ isFeatureEnabled: mockIsFeatureEnabled, toggleFeatureFlag: jest.fn() }}
      >
        <ExperimentalFeaturesSection />
      </FeatureFlagContext.Provider>
    );
    const checkbox = screen.getByLabelText(/Test Run/i);
    expect(checkbox).toBeChecked();
  });

  test('Calls toggleFeatureFlag with the correct key on click', () => {
    const mockToggle = jest.fn();

    render(
      <FeatureFlagContext.Provider
        value={{ isFeatureEnabled: () => false, toggleFeatureFlag: mockToggle }}
      >
        <ExperimentalFeaturesSection />
      </FeatureFlagContext.Provider>
    );

    const checkbox = screen.getByRole('checkbox', { name: /Test Run/i });
    fireEvent.click(checkbox);

    expect(mockToggle).toHaveBeenCalledTimes(1);
    expect(mockToggle).toHaveBeenCalledWith(FEATURE_FLAGS.TEST_RUNS);
  });
});
