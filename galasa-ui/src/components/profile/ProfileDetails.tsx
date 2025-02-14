/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import ErrorPage from "@/app/error/page";
import { UserData } from "@/generated/galasaapi";
import styles from "@/styles/MyProfile.module.css";
import { ProfileDetailsProps } from "@/utils/interfaces";
import { Loading } from "@carbon/react";
import { useEffect, useState } from "react";


export default function ProfileDetails({ userProfilePromise }: ProfileDetailsProps) {
  const WEB_UI_CLIENT_NAME = "web-ui";

  const [userProfile, setUserProfile] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    const loadUserProfile = async () => {
      setIsError(false);
      setIsLoading(true);

      try {
        const loadedProfile = await userProfilePromise;
        setUserProfile(loadedProfile);
      } catch (err) {
        setIsError(true);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userProfilePromise]);

  const roleName = userProfile.synthetic?.role?.metadata?.name;

  return (
    <div className={styles.profileDetails}>
      { isLoading ?
        <Loading data-testid="loader" small={false} active={isLoading} />
        : !isError &&
        <>
          <div className={styles.userDetailsContainer}>
            <h3>User Details</h3>
            <p>Currently logged in as: {userProfile?.loginId}</p>
            <p>Role: {roleName}</p>
          </div>

          <div className={styles.loginActivityContainer}>
            <h3>Recent Login Activity</h3>
            {
              userProfile?.clients?.map((client, index) => {
                let lastLoginDateStr: string;
                if (client.lastLogin) {
                  const clientLastLoginDate = new Date(client.lastLogin);
                  lastLoginDateStr = `${clientLastLoginDate.toUTCString()}`;
                } else {
                  lastLoginDateStr = "No last login date";
                }

                return (
                  <p key={index}>
                    {
                      client.clientName === WEB_UI_CLIENT_NAME
                        ? `Last logged in to this web application (UTC): ${lastLoginDateStr}`
                        : `Last logged in using a Galasa personal access token (UTC): ${lastLoginDateStr}`
                    }
                  </p>
                );
              })
            }
          </div>
        </>
      }
      { isError &&
        <ErrorPage />
      }
    </div>
  );
}
