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
import { FrontEndClient } from "@/generated/galasaapi";


export default function MyProfilePage() {

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [userData, setUserData] = useState<{
    loginId?: string;
    webLastLogin?: string;
    restApiLastLogin?: string
  }>({
    loginId: undefined,
    webLastLogin: undefined,
    restApiLastLogin: undefined,
  });

  const [clients, setClients] = useState<FrontEndClient[] | []>([]);

  const handleFetchUserData = async () => {

    setIsLoading(true);

    try {
      const response = await fetch('/users', { method: 'GET' });

      if (response.ok) {

        const data = await response.json();
        setUserData(data.userData);

        if (data.userData.clients) {
          const clientsWithDates: FrontEndClient[] = data.userData.clients.map(
            (client: any) => ({
              clientName: client.clientName,
              lastLogin: client.lastLogin ? new Date(client.lastLogin) : null,
            })
          );
          setClients(clientsWithDates);
        }

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
        <div>
          <h3 className={styles.loginActivityTile}>User Details</h3>
          <div className={styles.userNameContainer}>
            <h4>Currently logged in as:</h4>
            <h4> &nbsp; {userData.loginId}</h4>
          </div>

          <h3 className={styles.loginActivityTile}>Recent Login Activity</h3>

          {
            clients.map((client, index) => {

              const lastLoginDate = client.lastLogin;

              return (
                <div key={index} className={styles.loginActivityContainer}>
                  <h4 className={styles.clientName}>
                    {
                      client.clientName === "web-ui"
                        ?
                        "Last logged in to this web application (UTC):"
                        :
                        "Last logged in using a Galasa personal access token (UTC):"
                    }
                  </h4>

                  {/* Extracting the date and time from response */}
                  <h4>
                    &nbsp;
                    {lastLoginDate
                      ? `${lastLoginDate.toLocaleDateString()} ${lastLoginDate.toLocaleTimeString()}`
                      : 'No last login date'}
                  </h4>
                </div>
              );
            })
          }

        </div>
      }

      {isError &&
        <ToastNotification
          aria-label="closes notification"
          kind="error"
          onClose={function noRefCheck() { }}
          onCloseButtonClick={() => { setIsError(false); }}
          statusIconDescription="notification"
          caption="Failed to fetch user profile data."
          title="Internal Server Error"
        />
      }
    </div>
  );
};
