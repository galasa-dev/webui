/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Button, Modal, Dropdown, DatePicker, DatePickerInput } from '@carbon/react';
import { useRef, useState } from 'react';
import { TextInput } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import { useDateTimeFormat } from '@/contexts/DateTimeFormatContext';
import styles from '@/styles/tokens/TokenRequestModal.module.css';
import {
  TOKEN_PRESET_LIFESPANS,
  TOKEN_CUSTOM_VALUE_ID,
  TOKEN_CUSTOM_DEFAULT_LIFESPAN,
  TOKEN_MIN_LIFESPAN,
  TOKEN_MAX_LIFESPAN,
  LOCALE_TO_FLATPICKR_FORMAT_MAP,
  SUPPORTED_LOCALES,
} from '@/utils/constants/common';

export default function TokenRequestModal({ isDisabled }: { isDisabled: boolean }) {
  const translations = useTranslations('TokenRequestModal');
  const { formatDate, preferences } = useDateTimeFormat();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [selectedLifespan, setSelectedLifespan] = useState<string>(String(TOKEN_PRESET_LIFESPANS[0]));
  const [customLifespan, setCustomLifespan] = useState<number>(TOKEN_CUSTOM_DEFAULT_LIFESPAN);
  const [customExpiryDate, setCustomExpiryDate] = useState<Date | null>(null);
  const tokenNameInputRef = useRef<HTMLInputElement>(undefined);

  // Helper function to get the effective locale based on dateTimeFormatType
  const getEffectiveLocale = (): string => {
    if (preferences.dateTimeFormatType === 'browser') {
      // Get browser's locale
      const browserLocale = navigator.language || 'en-GB';
      // Check if it's a supported locale, otherwise default to en-GB
      const supportedLocale = SUPPORTED_LOCALES.find(loc => loc.code === browserLocale);
      return supportedLocale ? browserLocale : 'en-GB';
    }
    return preferences.locale;
  };

  const getExpiryDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return formatDate(date);
  };

  const getLifespanOptions = () => {
    const options = TOKEN_PRESET_LIFESPANS.map((days) => ({
      id: String(days),
      label: `${days} days (${getExpiryDate(days)})`,
    }));
    options.push({
      id: TOKEN_CUSTOM_VALUE_ID,
      label: translations('custom_lifespan'),
    });
    return options;
  };

  const getEffectiveLifespan = (): number => {
    if (selectedLifespan === TOKEN_CUSTOM_VALUE_ID) {
      if (customExpiryDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expiry = new Date(customExpiryDate);
        expiry.setHours(0, 0, 0, 0);
        const diffTime = expiry.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      }
      return customLifespan;
    }
    return parseInt(selectedLifespan, 10);
  };

  const onChangeInputValidation = () => {
    const tokenName = tokenNameInputRef.current?.value.trim() ?? '';
    const lifespan = getEffectiveLifespan();
    const isLifespanValid =
      Number.isInteger(lifespan) && lifespan >= TOKEN_MIN_LIFESPAN && lifespan <= TOKEN_MAX_LIFESPAN;
    setSubmitDisabled(!tokenName || !isLifespanValid);
  };

  const submitTokenRequest = async () => {
    try {
      const response = await fetch('/auth/tokens', {
        method: 'POST',
        body: JSON.stringify({
          tokenDescription: tokenNameInputRef.current?.value.trim(),
          tokenLifespanDays: getEffectiveLifespan(),
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const responseJson = await response.json();
      window.location.replace(responseJson.url);
    } catch (err) {
      let errorMessage = '';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }

      setError(errorMessage);
      console.error('Failed to request a personal access token: %s', err);
    }
  };

  return (
    <>
      <Button
        iconDescription={translations('new_access_token')}
        role="token-request-btn"
        disabled={isDisabled}
        hasIconOnly
        onClick={() => setOpen(true)}
      >
        <Add />
      </Button>
      <Modal
        modalHeading={translations('modal_heading')}
        primaryButtonText={translations('create')}
        primaryButtonDisabled={submitDisabled}
        secondaryButtonText={translations('cancel')}
        shouldSubmitOnEnter={true}
        open={open}
        className={styles.modalContent}
        onRequestClose={() => {
          setOpen(false);
          setError('');
          setSelectedLifespan(String(TOKEN_PRESET_LIFESPANS[0]));
          setCustomLifespan(TOKEN_CUSTOM_DEFAULT_LIFESPAN);
          setCustomExpiryDate(null);
        }}
        onRequestSubmit={async () => {
          if (!submitDisabled) {
            await submitTokenRequest();
          }
        }}
      >
        <p>{translations('token_description')}</p>

        <br />

        <p>{translations('token_name_description')}</p>

        <br />

        <TextInput
          data-modal-primary-focus
          ref={tokenNameInputRef}
          id="name-txtinput"
          labelText={translations('token_name')}
          helperText={translations('token_name_helper_text')}
          placeholder={translations('token_name_placeholder')}
          onChange={onChangeInputValidation}
        />

        <br />

        <Dropdown
          id="lifespan-dropdown"
          titleText={translations('token_lifespan')}
          label={translations('select_lifespan')}
          items={getLifespanOptions()}
          itemToString={(item: { id: string; label: string } | null) => (item ? item.label : '')}
          selectedItem={getLifespanOptions().find((opt) => opt.id === selectedLifespan)}
          onChange={({ selectedItem }: { selectedItem?: { id: string; label: string } }) => {
            if (selectedItem) {
              setSelectedLifespan(selectedItem.id);
              onChangeInputValidation();
            }
          }}
        />

        {selectedLifespan === TOKEN_CUSTOM_VALUE_ID && (
          <>
            <br />
            <DatePicker
              datePickerType="single"
              locale={getEffectiveLocale()?.split('-')[0] || 'en'}
              dateFormat={LOCALE_TO_FLATPICKR_FORMAT_MAP[getEffectiveLocale()]}
              minDate={new Date().setDate(new Date().getDate() + TOKEN_MIN_LIFESPAN)}
              maxDate={new Date().setDate(new Date().getDate() + TOKEN_MAX_LIFESPAN)}
              onChange={(dates: Date[]) => {
                if (dates && dates.length > 0) {
                  setCustomExpiryDate(dates[0]);
                  onChangeInputValidation();
                }
              }}
            >
              <DatePickerInput
                id="custom-expiry-date-input"
                placeholder={(() => {
                  const dateFormat = LOCALE_TO_FLATPICKR_FORMAT_MAP[getEffectiveLocale()];
                  return dateFormat
                    .replace(/Y/g, 'yyyy')
                    .replace(/m/g, 'mm')
                    .replace(/d/g, 'dd');
                })()}
                labelText={translations('custom_expiry_date')}
                helperText={translations('custom_expiry_date_helper_text')}
                invalid={(() => {
                  if (!customExpiryDate) return false;
                  const days = getEffectiveLifespan();
                  return days < TOKEN_MIN_LIFESPAN || days > TOKEN_MAX_LIFESPAN;
                })()}
                invalidText={translations('custom_expiry_date_invalid')}
              />
            </DatePicker>
          </>
        )}

        {error && (
          <InlineNotification
            className="margin-top-1"
            title={translations('error_requesting_token')}
            subtitle={error}
            kind="error"
            onCloseButtonClick={() => setError('')}
            lowContrast
          />
        )}
      </Modal>
    </>
  );
}
