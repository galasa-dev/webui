/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Button, Modal, Dropdown, NumberInput } from '@carbon/react';
import { useRef, useState } from 'react';
import { TextInput } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useTranslations } from 'next-intl';
import styles from '@/styles/tokens/TokenRequestModal.module.css';

const PRESET_LIFESPANS = [7, 30, 90];
const CUSTOM_VALUE_ID = 'custom';
const MIN_LIFESPAN = 1;
const MAX_LIFESPAN = 365;

export default function TokenRequestModal({ isDisabled }: { isDisabled: boolean }) {
  const translations = useTranslations('TokenRequestModal');

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const [selectedLifespan, setSelectedLifespan] = useState<string>(String(PRESET_LIFESPANS[0]));
  const [customLifespan, setCustomLifespan] = useState<number>(7);
  const tokenNameInputRef = useRef<HTMLInputElement>(undefined);

  const getExpiryDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  const getLifespanOptions = () => {
    const options = PRESET_LIFESPANS.map((days) => ({
      id: String(days),
      label: `${days} days (${getExpiryDate(days)})`,
    }));
    options.push({
      id: CUSTOM_VALUE_ID,
      label: translations('custom_lifespan'),
    });
    return options;
  };

  const getEffectiveLifespan = (): number => {
    if (selectedLifespan === CUSTOM_VALUE_ID) {
      return customLifespan;
    }
    return parseInt(selectedLifespan, 10);
  };

  const onChangeInputValidation = () => {
    const tokenName = tokenNameInputRef.current?.value.trim() ?? '';
    const lifespan = getEffectiveLifespan();
    const isLifespanValid = lifespan >= MIN_LIFESPAN && lifespan <= MAX_LIFESPAN;
    setSubmitDisabled(!tokenName || !isLifespanValid);
  };

  const submitTokenRequest = async () => {
    try {
      const response = await fetch('/auth/tokens', {
        method: 'POST',
        body: JSON.stringify({
          tokenDescription: tokenNameInputRef.current?.value.trim(),
          token_lifespan_days: getEffectiveLifespan(),
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
          setSelectedLifespan(String(PRESET_LIFESPANS[0]));
          setCustomLifespan(7);
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

        {selectedLifespan === CUSTOM_VALUE_ID && (
          <>
            <br />
            <NumberInput
              id="custom-lifespan-input"
              label={translations('custom_lifespan_days')}
              helperText={translations('custom_lifespan_helper_text')}
              min={MIN_LIFESPAN}
              max={MAX_LIFESPAN}
              value={customLifespan}
              onChange={(_e: unknown, { value }: { value?: number | null }) => {
                if (value !== undefined && value !== null) {
                  setCustomLifespan(value);
                  onChangeInputValidation();
                }
              }}
              invalidText={translations('custom_lifespan_invalid')}
              invalid={customLifespan < MIN_LIFESPAN || customLifespan > MAX_LIFESPAN}
            />
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
