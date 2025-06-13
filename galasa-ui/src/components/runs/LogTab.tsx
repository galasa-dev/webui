/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, OverflowMenu, Button } from '@carbon/react';
import styles from "@/styles/LogTab.module.css";
import { Checkbox } from '@carbon/react';
import { Filter, ChevronUp, ChevronDown, CharacterSentenceCase, TextUnderline, CloudDownload } from '@carbon/icons-react';
import { handleDownload } from '@/utils/functions';

interface LogLine {
  content: string;
  level: string;
  lineNumber: number;
  isVisible: boolean;
}

export default function LogTab({ logs }: { logs: string }) {

  const [logContent, setLogContent] = useState<string>('');
  const [processedLines, setProcessedLines] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [matchWholeWord, setMatchWholeWord] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    ERROR: true,
    WARN: true,
    DEBUG: true,
    INFO: true,
    TRACE: true
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: any) => {
    const value = e.target?.value || '';
    setSearchTerm(value);
    if (!value.trim()) {
      setCurrentMatchIndex(-1);
      setTotalMatches(0);
    }
  };

  const handleFilterChange = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      [level]: !prev[level as keyof typeof prev],
    }));
  };

  const toggleMatchCase = () => {
    setMatchCase(!matchCase);
  };

  const toggleMatchWholeWord = () => {
    setMatchWholeWord(!matchWholeWord);
  };

  const goToNextMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % totalMatches);
    }
  };

  const goToPreviousMatch = () => {
    if (totalMatches > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + totalMatches) % totalMatches);
    }
  };

  const createSearchRegex = (term: string) => {
    if (!term.trim()) return null;

    let escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (matchWholeWord) {
      escapedTerm = `\\b${escapedTerm}\\b`;
    }
    const flags = matchCase ? 'g' : 'gi';
    return new RegExp(escapedTerm, flags);
  };

  const getLogLevel = (line: string) => {
    // Check for explicit log levels in the line
    if (line.includes(' ERROR ')) return 'ERROR';
    if (line.includes(' WARN ')) return 'WARN';
    if (line.includes(' DEBUG ')) return 'DEBUG';
    if (line.includes(' INFO ')) return 'INFO';
    if (line.includes(' TRACE ')) return 'TRACE';

    // If no explicit level found, return null (will be assigned to previous level)
    return null;
  };

  const processLogLines = (content: string) => {
    const lines = content.split('\n');
    const processed: LogLine[] = [];
    let currentLevel = 'INFO'; // Default level

    lines.forEach((line, index) => {
      const detectedLevel = getLogLevel(line);

      // If we find a new level, update current level
      if (detectedLevel) {
        currentLevel = detectedLevel;
      }

      // All lines get assigned to the current level (either explicit or inherited)
      processed.push({
        content: line,
        level: currentLevel,
        lineNumber: index + 1,
        isVisible: true
      });
    });

    return processed;
  };

  const applyFilters = (lines: LogLine[]) => {

    const hasActiveFilters = Object.values(filters).some(filter => filter === true);

    if (!hasActiveFilters) {
      // none selected → hide all
      return lines.map(line => ({ ...line, isVisible: false }));
    }

    // only show lines whose level is still checked
    return lines.map(line => ({
      ...line,
      isVisible: !!filters[line.level as keyof typeof filters]
    }));
  };

  const highlightText = (text: string, searchTerm: string, lineIndex: number) => {
    if (!searchTerm.trim()) return text;

    const regex = createSearchRegex(searchTerm);
    if (!regex) return text;

    const parts = text.split(regex);
    const matches = text.match(regex);

    if (!matches) return text;

    let matchIndexInLine = 0;
    const result = [];

    for (let i = 0; i < parts.length; i++) {
      if (i > 0) {
        const match = matches[i - 1];
        const globalMatchIndex = getGlobalMatchIndex(lineIndex, matchIndexInLine);
        const isCurrentMatch = globalMatchIndex === currentMatchIndex;
        matchIndexInLine++;

        result.push(
          <span
            key={`match-${i}`}
            className={`${styles.highlight} ${isCurrentMatch ? styles.currentHighlight : ''}`}
            id={isCurrentMatch ? 'current-match' : undefined}
          >
            {match}
          </span>
        );
      }
      if (parts[i]) {
        result.push(parts[i]);
      }
    }

    return result;
  };

  const getGlobalMatchIndex = (lineIndex: number, matchIndexInLine: number) => {
    if (!searchTerm.trim()) return -1;

    const visibleLines = processedLines.filter(line => line.isVisible);
    let globalIndex = 0;

    for (let i = 0; i < lineIndex; i++) {
      if (i < visibleLines.length) {
        const regex = createSearchRegex(searchTerm);
        if (regex) {
          const matches = visibleLines[i].content.match(regex);
          if (matches) {
            globalIndex += matches.length;
          }
        }
      }
    }

    return globalIndex + matchIndexInLine;
  };

  const countMatches = (lines: LogLine[], searchTerm: string) => {
    if (!searchTerm.trim()) return 0;
    const regex = createSearchRegex(searchTerm);
    if (!regex) return 0;

    const visibleContent = lines
      .filter(line => line.isVisible)
      .map(line => line.content)
      .join('\n');

    const matches = visibleContent.match(regex);
    return matches ? matches.length : 0;
  };

  const renderLogContent = () => {
    if (!processedLines.length) return null;

    return processedLines.map((logLine, index) => {
      // Skip hidden lines
      if (!logLine.isVisible) {
        return null;
      }

      // Apply appropriate class based on log level
      const levelClass = logLine.level.toLowerCase();
      const colorClass = styles[levelClass as keyof typeof styles] || "";

      return (
        <div
          key={logLine.lineNumber}
          className={`${colorClass} ${styles.logEntry}`}
        >
          <span className={styles.lineNumberCol}>
            {logLine.lineNumber}.
          </span>
          <pre>{highlightText(logLine.content, searchTerm, index)}</pre>
        </div>
      );
    });
  };

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0) {
      const currentMatchElement = document.getElementById('current-match');
      if (currentMatchElement) {
        currentMatchElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentMatchIndex]);

  // Update total matches when search term, match options, or processed lines change
  useEffect(() => {
    const matches = countMatches(processedLines, searchTerm);
    setTotalMatches(matches);

    if (matches > 0 && currentMatchIndex === -1) {
      setCurrentMatchIndex(0);
    } else if (matches === 0) {
      setCurrentMatchIndex(-1);
    } else if (currentMatchIndex >= matches) {
      setCurrentMatchIndex(matches - 1);
    }
  }, [searchTerm, processedLines, matchCase, matchWholeWord]);

  // Process log content and apply filters
  useEffect(() => {
    if (logContent) {
      const processed = processLogLines(logContent);
      const filtered = applyFilters(processed);
      setProcessedLines(filtered);
    }
  }, [logContent, filters]);

  useEffect(() => {
    setLogContent(logs);
  }, [logs]);

  return (
    <div className={styles.tabContent}>
      <h3>Run Log</h3>
      <p>A step-by-step log of what happened over time when the Run was preparing a TestClass for execution, what happened when the TestClass was executed, and when the test environment was cleaned up.
        The RunLog is an Artifact, which can be downloaded and viewed.</p>
      <div className={styles.logContainer}>
        <div className={styles.searchContainer}>
          <Search
            placeholder="Find in run log"
            size="lg"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div className={styles.findControls}>
              <span className={styles.matchCounter}>
                {totalMatches > 0 ? `${currentMatchIndex + 1} of ${totalMatches}` : 'No matches'}
              </span>
              <Button
                kind="ghost"
                size="sm"
                onClick={goToPreviousMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronUp}
                iconDescription="Previous match"
                hasIconOnly
              />
              <Button
                kind="ghost"
                size="sm"
                onClick={goToNextMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronDown}
                iconDescription="Next match"
                hasIconOnly
              />
              <Button
                kind={matchCase ? "primary" : "ghost"}
                size="sm"
                onClick={toggleMatchCase}
                renderIcon={CharacterSentenceCase}
                iconDescription="Match case"
                hasIconOnly
              />
              <Button
                kind={matchWholeWord ? "primary" : "ghost"}
                size="sm"
                onClick={toggleMatchWholeWord}
                renderIcon={TextUnderline}
                iconDescription="Match whole word"
                hasIconOnly
              />
            </div>
          )}
        </div>
        <div className={styles.filterBtn}>
          <OverflowMenu size="lg" iconDescription={"Hide / Show Content"} renderIcon={Filter} flipped={true}>
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
              id="checkbox-info"
              labelText="Info"
              checked={filters.INFO}
              onChange={() => handleFilterChange('INFO')}
            />
            <Checkbox
              id="checkbox-debug"
              labelText="Debug"
              checked={filters.DEBUG}
              onChange={() => handleFilterChange('DEBUG')}
            />
            <Checkbox
              id="checkbox-trace"
              labelText="Trace"
              checked={filters.TRACE}
              onChange={() => handleFilterChange('TRACE')}
            />
          </OverflowMenu>
        </div>
        <Button
          kind="ghost"
          renderIcon={CloudDownload}
          hasIconOnly
          iconDescription="Download Run Log"
          onClick={() => handleDownload(logContent, "run.log")}
        />
      </div>
      <div className={styles.runLog}>
        <div className={styles.runLogContent} ref={logContainerRef}>
          {renderLogContent()}
        </div>
      </div>
    </div>
  );
}