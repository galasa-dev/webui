/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import { SavedQueryType } from '@/utils/types/common';
import { useState } from 'react';

const LOCAL_STORAGE_KEY = 'savedQueries';

/**
 * Custom hook to manage saved queries in local storage.
 * @returns An object containing saved queries and functions to manipulate them.
 *
 */
export default function useSavedQueries() {
  const [savedQueries, setSavedQueries] = useState<SavedQueryType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedQueries = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedQueries ? JSON.parse(storedQueries) : [];
    }
    return [];
  });

  /**
   * Save a new query to the list of saved queries.
   * @param query The query to save.
   */
  const saveQuery = (query: SavedQueryType) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = [...prevQueries, query];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  /**
   * Rename an existing saved query.
   * @param createdAt The creation timestamp of the query to rename.
   * @param newTitle The new title for the query.
   */
  const renameQuery = (createdAt: string, newTitle: string) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = prevQueries.map((query) =>
        query.createdAt === createdAt ? { ...query, title: newTitle } : query
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  /**
   * Delete a saved query.
   * @param createdAt The creation timestamp of the query to delete.
   */
  const deleteQuery = (createdAt: string) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = prevQueries.filter((query) => query.createdAt !== createdAt);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  return {
    savedQueries,
    setSavedQueries,
    saveQuery,
    renameQuery,
    deleteQuery,
  };
}
