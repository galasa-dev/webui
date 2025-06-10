/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use server';

import { ResultArchiveStoreAPIApi, Run, RunResults } from "@/generated/galasaapi";
import { createAuthenticatedApiConfiguration } from "@/utils/api";
import * as Constants from "@/utils/constants";

/**
 * Fetches test runs from the Result Archive Store (RAS) for the last 24 hours.
 * 
 * @param {string} loginId - The login ID of the user.
 * @returns {Promise<Run[]>} - A promise that resolves to an array of Run objects.
 */
export const fetchMyTestRunsForLastDay  = async (): Promise<Run[]> => {
  try {
    const apiConfig = createAuthenticatedApiConfiguration();
    const rasApiClient = new ResultArchiveStoreAPIApi(apiConfig);
      
    // Calculate the date for 24 hours ago
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 1);
      
    // Fetch runs from the last 24 hours
    const response: RunResults = await rasApiClient.getRasSearchRuns(
      'from:desc',
      Constants.CLIENT_API_VERSION,
      undefined,
      undefined,
      undefined,
      undefined,
      fromDate,        
    );
      
    if(response && response.runs) {
      const plainRuns = JSON.parse(JSON.stringify(response.runs));
      return plainRuns as Run[];
    }
 
    return [];
  } catch (error: any) {
    console.error("Error fetching test runs:", error);
    return [];
  }
};