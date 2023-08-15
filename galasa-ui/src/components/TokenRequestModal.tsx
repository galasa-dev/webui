 /*
 * Copyright contributors to the Galasa project
 */
'use client';

import { Button, Modal } from '@carbon/react';
import { useRef, useState } from 'react';
import { TextInput, PasswordInput } from '@carbon/react';
import { InlineNotification } from '@carbon/react';

export default function TokenRequestModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const tokenNameInputRef = useRef<HTMLInputElement>();
  const secretInputRef = useRef<HTMLInputElement>();

  const onChangeInputValidation = () => {
    const tokenName = tokenNameInputRef.current?.value ?? '';
    const secret = secretInputRef.current?.value ?? '';
    setSubmitDisabled(!tokenName || !secret);
  };

  const submitTokenRequest = async () => {
    const tokenName = tokenNameInputRef.current?.value ?? '';
    const secret = secretInputRef.current?.value ?? '';

    const codedSecret = Buffer.from(secret).toString('base64');

    // Call out to /auth/token with the payload for the name and secret for dex
    const tokenUrl = '/auth/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      body: JSON.stringify({ name: tokenName, secret: codedSecret }),
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    });

    const responseJson = await response.json();
    if (responseJson.error) {
      setError(responseJson.error);
    } else {
      // Redirect to authenticate with Dex
      window.location.replace(responseJson.url);
    }
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>Request Access Token</Button>
      <Modal
        modalHeading="Request a new Personal Access Token"
        modalLabel="Access Tokens"
        primaryButtonText="Submit"
        primaryButtonDisabled={submitDisabled}
        secondaryButtonText="Cancel"
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
        <TextInput
          data-modal-primary-focus
          ref={tokenNameInputRef}
          id="name-txtinput"
          labelText="Token Name"
          helperText="The name of your new personal access token."
          onChange={onChangeInputValidation}
        />
        <br style={{ marginBottom: '1rem' }} />
        <PasswordInput
          data-modal-primary-focus
          ref={secretInputRef}
          id="secret-txtinput"
          labelText="Galasa Client Secret"
          helperText="The client secret that you will use alongside your access token to access the galasa ecosystem."
          onChange={onChangeInputValidation}
        />
        {error && (
          <InlineNotification
            title="Error Requesting Access Token"
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
