/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import { createContext, ReactNode, useContext, useEffect } from 'react';
import { SavedQueriesMetaData, SavedQueryType } from '@/utils/types/common';
import { useState } from 'react';
import { DEFAULT_QUERY } from '@/utils/constants/common';

const SAVED_QUERIES_STORAGE_KEY = 'savedQueries';
const QUERIES_METADATA_STORAGE_KEY = 'queriesMetaData';

type SavedQueriesContextType = {
  savedQueries: SavedQueryType[];
  setSavedQueries: (queries: SavedQueryType[]) => void;
  saveQuery: (query: SavedQueryType) => void;
  updateQuery: (createdAt: string, updatedQuery: SavedQueryType) => void;
  deleteQuery: (createdAt: string) => void;
  isQuerySaved: (queryName: string) => boolean;
  getQuery: (queryName: string) => SavedQueryType | null;
  defaultQuery: SavedQueryType;
  setDefaultQuery: (createdAt: string) => void;
};

const SavedQueriesContext = createContext<SavedQueriesContextType | undefined>(undefined);

export function SavedQueriesProvider({ children }: { children: ReactNode }) {
  const [savedQueries, setSavedQueries] = useState<SavedQueryType[]>(() => {
    if (typeof window !== 'undefined') {
      const storedQueries = localStorage.getItem(SAVED_QUERIES_STORAGE_KEY);
      if (storedQueries) {
        return JSON.parse(storedQueries);
      }
    }

    // Initialize with default query if none are stored
    return [DEFAULT_QUERY];
  });

  const [metaData, setMetaData] = useState<SavedQueriesMetaData>(() => {
    if (typeof window !== 'undefined') {
      const storedMetaData = localStorage.getItem(QUERIES_METADATA_STORAGE_KEY);
      if (storedMetaData) {
        return JSON.parse(storedMetaData);
      }
    }
    return { defaultQueryId: DEFAULT_QUERY.createdAt };
  });

  // Find the default query based on metadata.
  const defaultQuery =
    savedQueries.find((query) => query.createdAt === metaData.defaultQueryId) || savedQueries[0];

  /**
   * Save a new query to the list of saved queries.
   * @param query The query to save.
   */
  const saveQuery = (query: SavedQueryType) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = [...prevQueries, query];
      localStorage.setItem(SAVED_QUERIES_STORAGE_KEY, JSON.stringify(updatedQueries));
      return updatedQueries;
    });
  };

  const updateQuery = (createdAt: string, updatedQuery: SavedQueryType) => {
    setSavedQueries((prevQueries) => {
      const updatedQueries = prevQueries.map((query) =>
        query.createdAt === createdAt ? updatedQuery : query
      );
      localStorage.setItem(SAVED_QUERIES_STORAGE_KEY, JSON.stringify(updatedQueries));
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
      localStorage.setItem(SAVED_QUERIES_STORAGE_KEY, JSON.stringify(updatedQueries));
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

  /**
   * Get a saved query by its name.
   * @param queryName The name of the query to retrieve.
   * @returns The saved query if found, null otherwise.
   */
  const getQuery = (queryName: string) => {
    return savedQueries.find((query) => query.title === queryName) || null;
  };

  /**
   * Set the default query by its createdAt timestamp.
   * @param createdAt The createdAt timestamp of the query to set as default.
   */
  const setDefaultQuery = (createdAt: string) => {
    setMetaData((prevMetaData) => ({
      ...prevMetaData,
      defaultQueryId: createdAt,
    }));
  };

  useEffect(() => {
    localStorage.setItem(QUERIES_METADATA_STORAGE_KEY, JSON.stringify(metaData));
  }, [metaData]);

  useEffect(() => {
    localStorage.setItem(SAVED_QUERIES_STORAGE_KEY, JSON.stringify(savedQueries));
  }, [savedQueries]);

  const value = {
    savedQueries,
    setSavedQueries,
    saveQuery,
    deleteQuery,
    updateQuery,
    isQuerySaved,
    getQuery,
    defaultQuery,
    setDefaultQuery,
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
