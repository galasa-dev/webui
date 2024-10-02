/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { useEffect, useState } from "react";
import { Loading, ToastNotification } from "@carbon/react";
import styles from "../../styles/MyProfile.module.css";
import PageTile from "@/components/PageTile";

export default function MyProfilePage() {

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loginId, setLoginId] = useState("");

  const handleFetchUserData = async () => {

    setIsLoading(true);

    try {
      const response = await fetch('/users', { method: 'GET' });

      if (response.ok) {

        const data = await response.text();
        setLoginId(data);

      }

    } catch (err) {
      setIsError(true);
      console.log(err);
    }
    finally {
      setIsLoading(false);
    }

  };

  useEffect(() => {

    handleFetchUserData();

  }, []);

  return (
    <div id="content" className={styles.content}>
      <PageTile title={"My Profile"} />

      {isLoading ?
        <Loading data-testid="loader" small={false} active={isLoading} />
        :
        <div className={styles.userNameContainer}>
          <h4>Currently logged in as:</h4>
          <h4> &nbsp; {loginId}</h4>
        </div>
      }

      {isError &&
                <ToastNotification
                  aria-label="closes notification"
                  kind="error"
                  onClose={function noRefCheck() { }}
                  onCloseButtonClick={function noRefCheck() { setIsError(false);}}
                  statusIconDescription="notification"
                  caption="Failed to fetch user profile data."
                  title="Internal Server Error"
                />    
      }
    </div>
  );
};
