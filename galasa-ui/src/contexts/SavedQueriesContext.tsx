/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { createContext, ReactNode, useContext } from 'react';
import { SavedQueryType } from '@/utils/types/common';
import { useState } from 'react';
import { DEFAULT_QUERY } from '@/utils/constants/common';

const LOCAL_STORAGE_KEY = 'savedQueries';

type SavedQueriesContextType = {
  savedQueries: SavedQueryType[];
  setSavedQueries: (queries: SavedQueryType[]) => void;
  saveQuery: (query: SavedQueryType) => void;
  updateQuery: (createdAt: string, updatedQuery: SavedQueryType) => void;
  renameQuery: (createdAt: string, newTitle: string) => void;
  deleteQuery: (createdAt: string) => void;
  isQuerySaved: (queryName: string) => boolean;
  getQuery: (queryName: string) => SavedQueryType | null;
};

const SavedQueriesContext = createContext<SavedQueriesContextType | undefined>(undefined);

export function SavedQueriesProvider({ children }: { children: ReactNode }) {
  const [savedQueries, setSavedQueries] = useState<SavedQueryType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedQueries = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedQueries ? JSON.parse(storedQueries) : [DEFAULT_QUERY];
    }
    return [];
  });

  // Get the current active query from the URL
  // const [activeQuery, setActiveQuery] = useState<SavedQueryType>(() => {
  //   const queryName = searchParams.get('q');
  // });

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

  const updateQuery = (createdAt: string, updatedQuery: SavedQueryType) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = prevQueries.map((query) =>
        query.createdAt === createdAt ? updatedQuery : query
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  /**
   * Rename an existing saved query.
   * @param currentTitle The current title of the query to rename.
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
   * @param createdAt The createdAt of the query to delete.
   */
  const deleteQuery = (createdAt: string) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = prevQueries.filter((query) => query.createdAt !== createdAt);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  /**
   * Check if a query with the given name is saved.
   * @param queryName The name of the query to check.
   * @returns True if the query is saved, false otherwise.
   */
  const isQuerySaved = (queryName: string) => {
    return savedQueries.some((query) => query.title === queryName);
  };

  const getQuery = (queryName: string) => {
    return savedQueries.find((query) => query.title === queryName) || null;
  };

  const value = {
    savedQueries,
    setSavedQueries,
    saveQuery,
    renameQuery,
    deleteQuery,
    updateQuery,
    isQuerySaved,
    getQuery,
  };
  return <SavedQueriesContext.Provider value={value}>{children}</SavedQueriesContext.Provider>;
}

/**
 * Custom hook to easily access the saved queries context.
 * @returns An object containing saved queries and functions to manipulate them.
 */
export function useSavedQueries() {
  const context = useContext(SavedQueriesContext);

  if (context === undefined) {
    throw new Error('useSavedQueries must be used within a SavedQueriesProvider');
  }

  return context;
}
