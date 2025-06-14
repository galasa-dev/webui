/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React, { useEffect, useState } from 'react';
import { Search, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import styles from "@/styles/LogTab.module.css";
import { Checkbox } from '@carbon/react';
import { Filter } from '@carbon/icons-react';

export default function LogTab({ logs }: { logs: string }) {

  const [logContent, setLogContent] = useState<string>('');
  const [filteredContent, setFilteredContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState({
    ERROR: false,
    WARN: false,
    DEBUG: false,
    INFO: false,
    TRACE: false
  });

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target?.value || '');
  };

  const handleFilterChange = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      [level]: !prev[level as keyof typeof prev],
    }));
  };

  const renderLogContent = () => {
    if (!filteredContent) return null;

    const lines = filteredContent.split('\n');

    return lines.map((line, index) => {
      // Parse log line to determine level
      let level = 'INFO';
      if (line.includes('ERROR')) {
        level = 'ERROR';
      } else if (line.includes('WARN')) {
        level = 'WARN';
      } else if (line.includes('DEBUG')) {
        level = 'DEBUG';
      } else if (line.includes('TRACE')) {
        level = 'TRACE';
      }

      // Apply appropriate class based on log level
      const levelClass = level.toLowerCase();
      const colorClass = styles[levelClass as keyof typeof styles] || ""; //select color class based on line type (e.g if error then make the color red for that line)

      return (
        <div
          key={index}
          className={`${colorClass} ${styles.logEntry}`}
        >
          <pre>    {index + 1}.   {line}</pre>
        </div>
      );
    });
  };

  useEffect(() => {
    let lines = logContent.split('\n');

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      lines = lines.filter(line => line.toLowerCase().includes(term));
    }

    // Check if any filters are active
    const hasActiveFilters = Object.values(filters).some(filter => filter === true);

    // Filter by log level only if there are active filters
    if (hasActiveFilters) {
      lines = lines.filter(line => {
        if (line.includes('ERROR')) return filters.ERROR;
        if (line.includes('WARN')) return filters.WARN;
        if (line.includes('DEBUG')) return filters.DEBUG;
        if (line.includes("TRACE")) return filters.TRACE;
        return filters.INFO; // Default to INFO if no other level found
      });
    }
    // If no filters are active, show all lines (don't filter by log level)

    setFilteredContent(lines.join('\n'));
  }, [searchTerm, logContent, filters]);

  useEffect(() => {
    setLogContent(logs);
  }, [logs]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContent(logContent);
    } else {
      // Filter log content based on search term
      const term = searchTerm.toLowerCase();
      const lines = logContent.split('\n');
      const filteredLines = lines.filter(line =>
        line.toLowerCase().includes(term)
      );

      setFilteredContent(filteredLines.join('\n'));
    }

  }, [searchTerm, logContent]);

  return (
    <div className={styles.tabContent}>
      <h3>Run Log</h3>
      <p>A step-by-step log of what happened over time when the Run was preparing a TestClass for execution, what happened when the TestClass was executed, and when the test environment was cleaned up.
        The RunLog is an Artifact, which can be downloaded and viewed.</p>
      <div className={styles.logContainer}>
        <Search
          placeholder="Search run log"
          size="lg"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className={styles.filterBtn}>
          <OverflowMenu iconOnly size="lg" renderIcon={Filter} flipped={true}>
            <Checkbox
              id="checkbox-error"
              labelText="Error"
              checked={filters.ERROR}
              onChange={() => handleFilterChange('ERROR')}
            />
            <Checkbox
              id="checkbox-warn"
              labelText="Warning"
              checked={filters.WARN}
              onChange={() => handleFilterChange('WARN')}
            />
            <Checkbox
              id="checkbox-debug"
              labelText="Debug"
              checked={filters.DEBUG}
              onChange={() => handleFilterChange('DEBUG')}
            />
            <Checkbox
              id="checkbox-info"
              labelText="Info"
              checked={filters.INFO}
              onChange={() => handleFilterChange('INFO')}
            />
            <Checkbox
              id="checkbox-trace"
              labelText="Trace"
              checked={filters.TRACE}
              onChange={() => handleFilterChange('TRACE')}
            />
          </OverflowMenu>
        </div>
      </div>
      <div className={styles.runLog}>
        <div className={styles.runLogContent}>
          {renderLogContent()}
        </div>
      </div>
    </div>

  );
};
