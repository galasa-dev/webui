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
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";


export default function ProfileDetails({ userProfilePromise }: ProfileDetailsProps) {
  const WEB_UI_CLIENT_NAME = "web-ui";
  const t = useTranslations("ProfileDetails");

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
            <h3>{t("title")}</h3>
            <p>{t("loggedInAs")} {userProfile?.loginId}</p>
            <p>{t("role")}: {roleName}</p>
          </div>

          <div className={styles.loginActivityContainer}>
            <h3>{t("recentActivity")}</h3>
            {
              userProfile?.clients?.map((client, index) => {
                let lastLoginDateStr: string;
                if (client.lastLogin) {
                  const clientLastLoginDate = new Date(client.lastLogin);
                  lastLoginDateStr = `${clientLastLoginDate.toUTCString()}`;
                } else {
                  lastLoginDateStr = t("noLastLogin");
                }

                return (
                  <p key={index}>
                    {
                      client.clientName === WEB_UI_CLIENT_NAME
                        ? t("lastLoginWeb", { date: lastLoginDateStr })
                        : t("lastLoginToken", { date: lastLoginDateStr })}

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
