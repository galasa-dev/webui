/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import styles from '@/styles/tokens/TokenCard.module.css';
import { Password } from '@carbon/icons-react';
import { SelectableTile } from '@carbon/react';
import { AuthToken } from '@/generated/galasaapi';
import { useTranslations } from 'next-intl';
import { useDateTimeFormat } from '@/contexts/DateTimeFormatContext';
import { useMemo } from 'react';

function TokenCard({
  token,
  selectTokenForDeletion,
}: {
  token: AuthToken;
  selectTokenForDeletion: Function;
}) {
  const translations = useTranslations('TokenCard');
  const { formatDate } = useDateTimeFormat();
  const formattedCreationDate = useMemo(() => {
    return formatDate(new Date(token.creationTime!));
  }, [token.creationTime, formatDate]);
  const formattedExpiryDate = useMemo(() => {
    return formatDate(new Date(token.expiryTime!));
  }, [token.expiryTime, formatDate]);

  return (
    <SelectableTile
      onClick={() => selectTokenForDeletion(token.tokenId)}
      value={true}
      key={token.tokenId}
      className={styles.cardContainer}
    >
      <h5>{token.description}</h5>

      <div className={styles.infoContainer}>
        <h6>
          {translations('createdAt')} {formattedCreationDate}
        </h6>
        { formattedExpiryDate && 
          <h6>
            {translations('expires')} {formattedExpiryDate}
          </h6>
        }
        <h6>
          {translations('owner')} {token.owner?.loginId}
        </h6>
      </div>

      <Password className={styles.icon} size={40} />
    </SelectableTile>
  );
}

export default TokenCard;
