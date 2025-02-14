/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import React, { useEffect, useState } from 'react';
import { ProfileDetailsProps } from '@/utils/interfaces';
import { UserData } from '@/generated/galasaapi';
import styles from "@/styles/UserRole.module.css";
import { ButtonSet, Button, Dropdown, Loading } from '@carbon/react';
import ErrorPage from '@/app/error/page';
import { InlineNotification } from '@carbon/react';

interface DropdownItem {
  name: string,
  description: string
}

export default function UserRoleSection({ userProfilePromise }: ProfileDetailsProps) {

  const [userProfile, setUserProfile] = useState<UserData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [role, setRole] = useState({
    id: "",
    name: "",
    description: ""
  });
  const [isSaveBtnDisabled, setIsSaveBtnDisabled] = useState(true);
  const [isResetBtnDisabled, setIsResetBtnDisabled] = useState(true);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const items = [
    {
      id: "1",
      name: 'tester',
      description: "Test developer and runner"
    }, {
      id: "2",
      name: 'admin',
      description: "Administrator access"
    }, {
      id: "0",
      name: 'deactivated',
      description: "User has no access"
    }
  ];

  useEffect(() => {
    const loadUserProfile = async () => {
      setIsError(false);
      setIsLoading(true);

      try {

        const loadedProfile = await userProfilePromise;
        setUserProfile(loadedProfile);
        setRole({ id: loadedProfile.synthetic?.role?.metadata?.id!, name: loadedProfile.synthetic?.role?.metadata?.name!, description: loadedProfile.synthetic?.role?.metadata?.description! });

      } catch (err) {
        setIsError(true);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
  }, [userProfilePromise]);

  const changeUserRole = (e: any) => {

    setRole({
      id: e.selectedItem.id,
      name: e.selectedItem.name,
      description: e.selectedItem.description
    });

    setIsResetBtnDisabled(false);
    setIsSaveBtnDisabled(false);

  };

  const resetRole = () => {

    setRole({
      id: userProfile.synthetic?.role?.metadata?.id!,
      name: userProfile.synthetic?.role?.metadata?.name!,
      description: userProfile.synthetic?.role?.metadata?.description!
    });

    setIsResetBtnDisabled(true);
    setIsSaveBtnDisabled(true);

  };

  const updateUserRole = async () => {

    const requestBody = {
      roleDetails : {
        role: role.id
      },
      userNumber: userProfile.id
    };

    try {
      const response = await fetch('/users/edit/updateUserRole', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        setIsResetBtnDisabled(true);
        setIsSaveBtnDisabled(true);
        setIsToastVisible(true);
      }
    } catch (err) {
      setIsError(true);      
    }

  };

  if (isLoading) {
    return <Loading small={false} active={isLoading} />;
  }

  if (isError) {
    return <ErrorPage />;
  }

  return (
    <div className={styles.roleDetails}>
      <div className={styles.roleDetailsContainer}>
        <h2>{userProfile.loginId}</h2>
        <h4>User Role</h4>
        <p>The actions a user can or cannot on this Galasa service is controlled by their user role.</p>
        <div className={styles.dropdownContainer}>
          <Dropdown onChange={(e: any) => changeUserRole(e)} style={{ "width": "35%" }} size="lg" id="default" helperText={role.description} label={role.name} items={items} itemToString={(item: DropdownItem) => item ? item.name : ''} />
          <ButtonSet className={styles.buttonSet}>
            <Button onClick={resetRole} disabled={isResetBtnDisabled} kind="secondary">Reset</Button>
            <Button onClick={updateUserRole} disabled={isSaveBtnDisabled} kind="primary">Save</Button>
          </ButtonSet>
        </div>

        {
          isToastVisible && <InlineNotification inline={true} onClose={() => setIsToastVisible(false)} lowContrast={true} kind="success" title="Success" subtitle="User role was updated successfully." />
        }

      </div>
    </div>
  );
}
