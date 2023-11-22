/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

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

      deleteCookie('refresh_token');
      deleteCookie('client_id');
      deleteCookie('client_secret');
    }
  }, [clientId, clientSecret, refreshToken]);

  return (
    <Modal
      size="md"
      id="token-passiveModal"
      open={isOpen}
      passiveModal
      modalLabel="Personal Access Token Details"
      modalHeading="A new Personal Access Token has been allocated"
      preventCloseOnClickOutside
      onRequestClose={() => {
        setOpen(false);
      }}
    >
      <p>Copy the following properties into the galasactl.properties file, so your client tool can then access this Galasa Ecosystem.</p>
      <CodeSnippet type="multi" feedback="Copied to clipboard">
{
`GALASA_ACCESS_TOKEN=${token}
GALASA_CLIENT_ID=${clientIdState}
GALASA_SECRET=${secret}`
}
      </CodeSnippet>
      <p>If you do not have a galasactl.properties file in your GALASA_HOME directory (see the <a href='https://galasa.dev/docs'>Galasa documentation</a> for more information), run the following galasactl command:</p>
      <CodeSnippet className="margin-y-1" type="inline">{`galasactl local init`}</CodeSnippet>
      <InlineNotification
        title="The above information is not stored on the Galasa Ecosystem or within the web user interface."
        subtitle="When you dismiss this panel, you will be unable to retrieve the above information."
        kind="warning"
        lowContrast
        hideCloseButton
      />
    </Modal>
  );
}
