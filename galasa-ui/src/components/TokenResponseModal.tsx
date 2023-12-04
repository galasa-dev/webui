/*
 * Copyright contributors to the Galasa project
 */
'use client';

import AuthCookies from '@/utils/authCookies';
import { InlineNotification } from '@carbon/react';
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

      deleteCookie(AuthCookies.REFRESH_TOKEN);
      deleteCookie(AuthCookies.CLIENT_ID);
      deleteCookie(AuthCookies.CLIENT_SECRET);
    }
  }, [clientId, clientSecret, refreshToken]);

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
        Copy the following properties into the galasactl.properties file in your Galasa home directory* to allow your client tool to access the Galasa
        Ecosystem.
      </p>
      <CodeSnippet type="multi">
        {`GALASA_ACCESS_TOKEN=${token}
GALASA_CLIENT_ID=${clientIdState}
GALASA_SECRET=${secret}`}
      </CodeSnippet>
      <InlineNotification
        title="The personal access token details are not stored and cannot be retrieved when this dialog is closed."
        subtitle="Remember to copy the details shown above before closing this dialog."
        kind="warning"
        lowContrast
        hideCloseButton
      />
      <p className="margin-top-1">
        *If you do not have a galasactl.properties file in your Galasa home directory,
        run the following command to create one:
      </p>
      <CodeSnippet className="margin-y-1" type="inline" align="right">{`galasactl local init`}</CodeSnippet>
      <p>See the <a href="https://galasa.dev/docs/initialising-home-folder" target="_blank">Galasa documentation</a> for more information.</p>
    </Modal>
  );
}
