/*
 * Copyright contributors to the Galasa project
 */
'use client';

import { InlineNotification } from '@carbon/react';
import { Modal, CodeSnippet } from '@carbon/react';
import { useEffect, useState } from 'react';

interface TokenResponseModalProps {
  refreshToken: string;
  clientId: string;
  onLoad: () => Promise<void>;
}

export default function TokenResponseModal({ refreshToken, clientId, onLoad }: TokenResponseModalProps) {
  const [token, setToken] = useState('');
  const [clientIdState, setClientId] = useState('');
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    if (refreshToken.length > 0 && clientId.length > 0) {
      setToken(refreshToken);
      setClientId(clientId);
      setOpen(true);

      onLoad().catch((err) => console.error('Failed to load token response dialog: %s', err));
    }
  }, [clientId, refreshToken, onLoad]);

  return (
    <Modal
      size="lg"
      className="padding-x-13"
      id="token-passiveModal"
      open={isOpen}
      passiveModal
      modalHeading="Personal access token details"
      preventCloseOnClickOutside
      onRequestClose={() => {
        setOpen(false);
      }}
    >
      <p>
        Copy the following property into the galasactl.properties file in your Galasa home directory* or set it as an environment variable in your
        terminal to allow your client tool to access the Galasa Ecosystem.
      </p>
      <CodeSnippet type="multi">{`GALASA_TOKEN=${token}:${clientIdState}`}</CodeSnippet>
      <InlineNotification
        title="The personal access token details are not stored and cannot be retrieved when this dialog is closed."
        subtitle="Remember to copy the details shown above before closing this dialog."
        kind="warning"
        lowContrast
        hideCloseButton
      />
      <p className="margin-top-1">
        *If you do not have a galasactl.properties file in your Galasa home directory, run the following command to create one:
      </p>
      <CodeSnippet className="margin-y-1" type="inline" align="right">{`galasactl local init`}</CodeSnippet>
      <p>
        See the{' '}
        <a href="https://galasa.dev/docs/initialising-home-folder" target="_blank">
          Galasa documentation
        </a>{' '}
        for more information.
      </p>
    </Modal>
  );
}
