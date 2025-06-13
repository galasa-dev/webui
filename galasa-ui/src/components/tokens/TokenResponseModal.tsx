/*
 * Copyright contributors to the Galasa project
 */
'use client';

import { InlineNotification } from '@carbon/react';
import { Modal, CodeSnippet } from '@carbon/react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface TokenResponseModalProps {
  refreshToken: string;
  clientId: string;
  onLoad: () => Promise<void>;
}

export default function TokenResponseModal({ refreshToken, clientId, onLoad }: TokenResponseModalProps) {
  const t = useTranslations('TokenResponseModal');

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
      modalHeading={t('modalHeading')}
      preventCloseOnClickOutside
      onRequestClose={() => {
        setOpen(false);
      }}
    >
      <p>
        {t('description1')}
      </p>
      <CodeSnippet type="multi" wrapText>{`GALASA_TOKEN=${token}:${clientIdState}`}</CodeSnippet>
      <InlineNotification
        title={t('warningTitle')}
        subtitle={t('warningSubtitle')}
        kind="warning"
        lowContrast
        hideCloseButton
      />
      <p className="margin-top-1">
        {t('description2')}
      </p>
      <CodeSnippet className="margin-y-1" type="multi" align="right">{t('commandExample')}</CodeSnippet>
      <p>
        {t('seeDocsIntro')}{' '}
        <a href="https://galasa.dev/docs/initialising-home-folder" target="_blank" rel="noopener noreferrer">
          {t('seeDocsLinkText')}
        </a>{' '}
        {t('seeDocsOutro')}
      </p>
    </Modal>
  );
}