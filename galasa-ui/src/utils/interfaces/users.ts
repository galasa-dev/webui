/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { UserData } from '@/generated/galasaapi';

/**
 * Interfaces related to user management, authentication, and profiles
 */

export interface ProfileDetailsProps {
  userProfilePromise: Promise<UserData>;
}

export interface UpdateUserRolePayload {
  userNumber: string;
  roleDetails: {
    role: string;
  };
}
