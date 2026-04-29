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
  expiryWarningDays,
}: {
  token: AuthToken;
  selectTokenForDeletion: Function;
  expiryWarningDays: number;
}) {
  const translations = useTranslations('TokenCard');
  const { formatDate } = useDateTimeFormat();
  const formattedCreationDate = useMemo(() => {
    return formatDate(new Date(token.creationTime!));
  }, [token.creationTime, formatDate]);
  const formattedExpiryDate = useMemo(() => {
    return formatDate(new Date(token.expiryTime!));
  }, [token.expiryTime, formatDate]);

  // Check if token is expired
  const isExpired = useMemo(() => {
    if (!token.expiryTime) return false;
    return new Date(token.expiryTime) < new Date();
  }, [token.expiryTime]);

  const isNearlyExpired = useMemo(() => {
    if (!token.expiryTime || isExpired) return false;

    const expiryTime = new Date(token.expiryTime).getTime();
    const currentTime = Date.now();
    // Where 86400000 = 24 hours in milliseconds = 24 * 60 * 60 * 1000
    const warningWindowInMilliseconds = expiryWarningDays * 86400000;

    return expiryTime - currentTime <= warningWindowInMilliseconds;
  }, [token.expiryTime, isExpired, expiryWarningDays]);

  return (
    <SelectableTile
      onClick={() => selectTokenForDeletion(token.tokenId)}
      value={true}
      key={token.tokenId}
      className={`${styles.cardContainer} ${isExpired ? styles.cardContainerExpired : ''}`}
    >
      <h5>{token.description}</h5>

      <div className={styles.infoContainer}>
        <h6>
          {translations('createdAt')} {formattedCreationDate}
        </h6>
        {formattedExpiryDate &&
          <h6 className={isExpired ? styles.expiredLabel : ''}>
            {isExpired ? translations('expired') : translations('expires')} {formattedExpiryDate}
          </h6>
        }
        <h6>
          {translations('owner')} {token.owner?.loginId}
        </h6>
      </div>

      <div className={styles.iconWarningContainer}>
        <Password className={styles.icon} size={40} />
        {isNearlyExpired && (
          <p className={styles.expiryWarning}>
            {translations('nearlyExpiredWarning')}
          </p>
        )}
      </div>
    </SelectableTile>
  );
}

export default TokenCard;
