/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useRef, useState } from 'react';
import { TextInput } from '@carbon/react';
import { InlineNotification } from '@carbon/react';
import { Loading,Modal} from "@carbon/react";
import Token from '@/utils/interfaces/Token';
import TokenRequestModalProps from '@/utils/interfaces/TokenRequestModalProps';

export default function TokenRequestModal({ tokens, selectedTokens, deleteTokenFromSet, updateDeleteModalState }: TokenRequestModalProps) {

  const [open, setOpen] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const deleteTokensById = async () => {

    try {

      setIsLoading(true);
      //Convert set to array so we can iterate for it
      const tokensArray: Token[] = Array.from(tokens);

      for (const token of tokensArray) {  //using loop to handle multiple token deletion at once
        if (selectedTokens.has(token.tokenId)) {

          const response = await fetch(`/auth/tokens`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tokenId: token.tokenId }),
          });

          if (response.status === 204) {

            //Update the tokens after deletion
            deleteTokenFromSet(token);
            setOpen(false);

          }
        }
      }

    } catch (err) {
      let errorMessage = '';

      if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = String(err);
      }

      setError(errorMessage);
      console.error('Failed to delete a personal access token: %s', err);
    }
    finally {
      setIsLoading(false);
    }

  };

  if(isLoading){
    <Loading  />;
  }


  return (
    <>
      <Modal
        modalHeading="Delete Access Tokens"
        primaryButtonText="Delete"
        secondaryButtonText="Cancel"
        danger
        shouldSubmitOnEnter={true}
        open={open}
        onRequestClose={() => {
          setOpen(false);
          setError('');
          updateDeleteModalState();
        }}
        onRequestSubmit={async () => {
          await deleteTokensById();
        }}
      >
        <h6 className='margin-top-1'>
                    Number of access tokens to delete: {selectedTokens.size}
        </h6>

        <div className='margin-top-2'>
          <InlineNotification
            title="Client programs using these access tokens will no longer have access to this Galasa Service."
            subtitle="This operation is irreversible, though new access tokens can be created to replace the ones being deleted."
            kind="warning"
            lowContrast
            hideCloseButton
          />
        </div>
        <br />

        {error && (
          <InlineNotification
            className="margin-top-1"
            title="Error deleting access token"
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
