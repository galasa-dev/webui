/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import {
  compressToEncodedURIComponent as compress,
  decompressFromEncodedURIComponent as decompress,
} from 'lz-string';
import { minifyState, expandState } from './urlStateMappers';
import { RESULTS_TABLE_COLUMNS, TEST_RUNS_QUERY_PARAMS } from '../constants/common';

function paramsToObject(params: URLSearchParams): Record<string, string> {
  const obj: Record<string, string> = {};
  params.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
}

function objectToParams(obj: Record<string, any>): URLSearchParams {
  const params = new URLSearchParams();
  for (const key in obj) {
    // Ensure we only add keys that have a non-undefined value
    if (obj[key] !== undefined) {
      params.set(key, obj[key]);
    }
  }
  return params;
}

/**
 * Compresses a query string into a highly compact, URL-safe string.
 */
export function encodeStateToUrlParam(queryString: string): string {
  if (!queryString) {
    return '';
  }
  try {
    const params = new URLSearchParams(queryString);
    let paramObject = paramsToObject(params);

    paramObject = checkUrlParamsContainsAllQueryParameterFields(paramObject);

    // T minify the object before doing anything else
    const minifiedObject = minifyState(paramObject);
    if (Object.keys(minifiedObject).length === 0) {
      return '';
    }

    const jsonString = JSON.stringify(minifiedObject);
    return compress(jsonString);
  } catch (error) {
    console.error('Failed to encode URL state:', error);
    return '';
  }
}

/**
 * Introduced to ensure that when new results table columns/search criteria
 * are added, any pre-existing saved queries without that field in the encoded
 * URL have the new column added.
 */
export function checkUrlParamsContainsAllQueryParameterFields(
  params: Record<string, string>
): Record<string, string> {
  // columnsOrder param used here as its used to populate TableDesignContent.
  const columnsOrderParam = params[TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER];

  if (columnsOrderParam) {
    const columnsOrderFromURL = columnsOrderParam
      .split(',')
      .map((col) => col.trim())
      .filter(Boolean);

    const allColumnIds = RESULTS_TABLE_COLUMNS.map((col) => col.id);
    const columnsOrderSet = new Set(columnsOrderFromURL);

    // If adding a new column into the parameters, slot it in after
    // its predecessor in the default order of the results table columns.
    for (let colIndex = 0; colIndex < allColumnIds.length; colIndex++) {
      const columnId = allColumnIds[colIndex];

      if (columnsOrderSet.has(columnId)) {
        continue;
      }

      let insertIndex = 0;
      for (let aPreviousIndex = colIndex - 1; aPreviousIndex >= 0; aPreviousIndex--) {
        const predecessor = allColumnIds[aPreviousIndex];
        const predecessorIndex = columnsOrderFromURL.indexOf(predecessor);

        if (predecessorIndex !== -1) {
          insertIndex = predecessorIndex + 1;
          break;
        }
      }

      columnsOrderFromURL.splice(insertIndex, 0, columnId);
      columnsOrderSet.add(columnId);
    }

    // Update parameter in URL with full columns list
    params[TEST_RUNS_QUERY_PARAMS.COLUMNS_ORDER] = columnsOrderFromURL.join(',');
  }

  return params;
}

/**
 * Decodes a compact, URL-safe string and decompresses it back to the original query string.
 */
export function decodeStateFromUrlParam(encodedParam: string): string | null {
  if (!encodedParam) {
    return null;
  }
  try {
    const decompressedJson = decompress(encodedParam);
    if (decompressedJson) {
      const minifiedObject = JSON.parse(decompressedJson);

      // expand the object to restore the full state
      const expandedObject = expandState(minifiedObject);

      return objectToParams(expandedObject).toString();
    }
    return null;
  } catch (error) {
    console.error('Failed to decode URL state:', error);
    return null;
  }
}
