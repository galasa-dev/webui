/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
import { CheckmarkFilled, ErrorOutline,Renew, Warning } from '@carbon/icons-react';
import React from 'react';
import styles from "@/styles/StatusCheck.module.css";
import { COLORS } from '@/utils/constants';

function StatusCheck({ status }: { status: string }) {
  return (
    <>
      {
        status === "Passed" ? (
          <p className={styles.status}><CheckmarkFilled size={20} color={COLORS.GREEN} /> {status}</p>
        ) : (status === "Failed" || status === "Hung" || status === "EnvFail") ? (
          <p className={styles.status}><ErrorOutline size={20} color={COLORS.RED} /> {status}</p>
        ) : (status === "Cancelled" || status === "Ignored") ? (
          <p className={styles.status}><ErrorOutline size={20} color={COLORS.NEUTRAL} /> {status}</p>
        ) : (status === "Requeued") ? (
          <p className={styles.status}><Renew size={20} color={COLORS.BLUE}/> {status}</p>
        ) : (
          <p className={styles.status}><Warning size={20} color={COLORS.YELLOW} />Unknown</p>
        )
      }
    </>
  );
}

export default StatusCheck;