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

export default function TokenRequestModal() {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(true);
  const tokenNameInputRef = useRef<HTMLInputElement>();

  const onChangeInputValidation = () => {
    const tokenName = tokenNameInputRef.current?.value ?? '';
    setSubmitDisabled(!tokenName);
  };

  const submitTokenRequest = async () => {
    // Call out to /auth/token
    const tokenUrl = '/auth/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
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
      <Button onClick={() => setOpen(true)}>Request Personal Access Token</Button>
      <Modal
        modalHeading="Request a new Personal Access Token"
        modalLabel="Personal Access Token Details"
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
        <p>
          A personal access token is an alternative to using a password for authentication. It can be used to configure the galasactl command line
          tool and interact with the Galasa Ecosystem API, so that client tools can access this Galasa Ecosystem on your behalf with your permissions.
          Such a personal access token should be kept secret and never shared with others.
        </p>
        <br />
        <TextInput
          data-modal-primary-focus
          ref={tokenNameInputRef}
          id="name-txtinput"
          labelText="Token Name"
          helperText="The name of your new personal access token. Use this to distinguish between your tokens in the future."
          placeholder="galasactl access for my Windows machine"
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
