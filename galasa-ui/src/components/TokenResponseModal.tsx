/*
 * Copyright contributors to the Galasa project
 */
'use client';

import { Modal, CodeSnippet } from '@carbon/react';
import { useEffect, useState } from 'react';

interface TokenResponseModalProps {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export default function TokenResponseModal({ refreshToken, clientId, clientSecret }: TokenResponseModalProps) {
  const [token, setToken] = useState('');
  const [clientIdState, setClientId] = useState('');
  const [secret, setSecret] = useState('');
  const [isOpen, setOpen] = useState(false);

  const deleteCookie = (cookieId: string) => {
    const expiryDate = new Date().toUTCString();
    document.cookie = `${cookieId}=; expires=${expiryDate}; path=/;`;
  };

  useEffect(() => {
    if (refreshToken.length > 0 && clientId.length > 0 && clientSecret.length > 0) {
      setToken(refreshToken);
      setClientId(clientId);
      setSecret(clientSecret);
      setOpen(true);
    }
  }, [clientId, clientSecret, refreshToken]);

  return (
    <Modal
      size="md"
      id="token-passiveModal"
      open={isOpen}
      passiveModal
      modalLabel="Access Tokens"
      modalHeading="Copy the following YAML code into your galasactl.yaml file"
      onRequestClose={() => {
        setOpen(false);
        deleteCookie('refresh_token');
        deleteCookie('client_id');
        deleteCookie('client_secret');
      }}
    >
      <CodeSnippet type="multi" feedback="Copied to clipboard">
        {`auth:
  client-id: ${clientIdState}
  secret: ${secret}
  access-token: ${token}`}
      </CodeSnippet>
      <p>If you do not have a galasactl.yaml file in your $GALASA_HOME directory, run the following galasactl command:</p>
      <CodeSnippet type="inline">{`galasactl local init`}</CodeSnippet>
    </Modal>
  );
}
