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
  const t= useTranslations('AccessDeniedModal');  

  return (
    <Modal
      modalHeading={t("modalHeading")}
      primaryButtonText={t("logoutButton")}
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
          subtitle={t("notificationSubtitle")}
          kind="warning"
          lowContrast
          hideCloseButton
        />
        <p className='margin-top-2'>{t("helpText")}</p>
      </div>

    </Modal>
  );
}

export default AccessDeniedModal;