/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import React from 'react';
import { Modal, InlineNotification } from "@carbon/react";
import { handleDeleteCookieApiOperation } from '@/utils/logout';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

function AccessDeniedModal() {

  const router = useRouter();
  const translations= useTranslations('AccessDeniedModal');  

  return (
    <Modal
      modalHeading={translations("modalHeading")}
      primaryButtonText={translations("logoutButton")}
      open={true}
      onRequestSubmit={async () => {
        await handleDeleteCookieApiOperation(router);
      }}
      onRequestClose={async () => {
        await handleDeleteCookieApiOperation(router);
      }}
    >

      <div className='margin-top-2'>
        <InlineNotification
          subtitle={translations("notificationSubtitle")}
          kind="warning"
          lowContrast
          hideCloseButton
        />
        <p className='margin-top-2'>{translations("helpText")}</p>
      </div>

    </Modal>
  );
}

export default AccessDeniedModal;