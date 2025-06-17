
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

export interface UpdateUserRolePayload {
  userNumber: string;
  roleDetails: {
    role: string;
  };
}

export interface RunMetadata {

  runId: string;
  result: string;
  status: string;
  testName: string;
  runName: string;
  bundle: string;
  submissionId: string;
  group: string;
  requestor: string;
  submitted: string;
  startedAt: string;
  finishedAt: string;
  duration : string;
  tags: string[]

}

// DataTableHeader, DataTableCell, DataTableRow are IBM Carbon interfaces
export interface DataTableHeader {
  key: string,
  header: string
}

export interface DataTableCell {
  id: string;
  value: string;
  isEditable: boolean;
  isEditing: boolean;
  isValid: boolean;
  errors: null | Array<Error>;
  info: {
    header: string;
  };
}

export interface DataTableRow {
  id: string;
  cells: DataTableCell[];
  disabled?: boolean;
  isExpanded?: boolean;
  isSelected?: boolean;
}


export interface TimeFrameValues {
    fromDate: Date;
    fromTime: string;
    fromAmPm: 'AM' | 'PM';
    fromTimeZone: string;
    toDate: Date;
    toTime: string;
    toAmPm: 'AM' | 'PM';
    toTimeZone: string;
    durationDays: number;
    durationHours: number;
    durationMinutes: number;
}