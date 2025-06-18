/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { Button, Modal } from '@carbon/react';
import { useRef, useState } from 'react';
import { TextInput } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { Add } from '@carbon/icons-react';
import { useTranslations } from 'next-intl';

export default function TokenRequestModal({isDisabled} : {isDisabled : boolean}) {

  const translations = useTranslations('TokenRequestModal');

  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const tokenNameInputRef = useRef<HTMLInputElement>();

  const onChangeInputValidation = () => {
    const tokenName = tokenNameInputRef.current?.value.trim() ?? '';
    setSubmitDisabled(!tokenName);
  };

  const submitTokenRequest = async () => {
    try {
      const response = await fetch('/auth/tokens', {
        method: 'POST',
        body: JSON.stringify({
          tokenDescription: tokenNameInputRef.current?.value.trim()
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
      <Button iconDescription={translations('new_access_token')} role="token-request-btn" disabled={isDisabled} hasIconOnly onClick={() => setOpen(true)}>
        <Add/>
      </Button>
      <Modal
        modalHeading={translations('modal_heading')}
        primaryButtonText={translations('create')}
        primaryButtonDisabled={submitDisabled}
        secondaryButtonText={translations('cancel')}
        shouldSubmitOnEnter={true}
        open={open}
        onRequestClose={() => {
          setOpen(false);
          setError('');
        }}
        onRequestSubmit={async () => {
          if (!submitDisabled) {
            await submitTokenRequest();
          }
        }}
      >
        <p>
          {translations('token_description')}
        </p>

        <br />

        <p>
          {translations('token_name_description')}
        </p>

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
};
