
/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { UserData } from "@/generated/galasaapi";

export interface MarkdownResponse {
  markdownContent: string;
  responseStatusCode: number;
}

export interface ProfileDetailsProps {
  userProfilePromise: Promise<UserData>;
}