/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { Search, OverflowMenu, Button } from "@carbon/react";
import styles from "@/styles/LogTab.module.css";
import { Checkbox } from "@carbon/react";
import {
  Filter,
  ChevronUp,
  ChevronDown,
  CharacterSentenceCase,
  TextUnderline,
  CloudDownload,
} from "@carbon/icons-react";
import { handleDownload } from "@/utils/artifacts";
import { useTranslations } from "next-intl";

interface LogLine {
  content: string;
  level: string;
  lineNumber: number;
  isVisible: boolean;
}

enum RegexFlags {
  AllMatches = "g",
  AllMatchesIgnoreCase = "gi",
}

export default function LogTab({ logs }: { logs: string }) {
  const translations = useTranslations("LogTab");

  const [logContent, setLogContent] = useState<string>("");
  const [processedLines, setProcessedLines] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(-1);
  const [totalMatches, setTotalMatches] = useState<number>(0);
  const [matchCase, setMatchCase] = useState<boolean>(false);
  const [matchWholeWord, setMatchWholeWord] = useState<boolean>(false);
  const [filters, setFilters] = useState({
    ERROR: true,
    WARN: true,
    DEBUG: true,
    INFO: true,
    TRACE: true,
  });

  const logContainerRef = useRef<HTMLDivElement>(null);

  const handleSearchChange = (e: any) => {
    const value = e.target?.value || "";
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
    let escapedTerm: string = "";

    if (!term.trim()) {
      escapedTerm = "";
    } else {
      escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // Prefix any special regex character in `term` with a backslash so the whole string is used literally in a RegExp
      if (matchWholeWord) {
        escapedTerm = `\\b${escapedTerm}\\b`;
      }

      // If matchCase is false, we use the 'gi' flag to ignore case
      const flags = matchCase
        ? RegexFlags.AllMatches
        : RegexFlags.AllMatchesIgnoreCase;
      return new RegExp(escapedTerm, flags);
    }

    return escapedTerm;
  };

  const getLogLevel = (line: string) => {
    let logLevel: string | null = null;

    // Attempt to parse a timestamp and log level by splitting the line.
    const tokens = line.trim().split(" ");
    if (
      tokens.length >= 3 &&
      tokens[0].length === 10 && // Simple check for DD/MM/YYYY format
      tokens[0].charAt(2) === "/" &&
      tokens[0].charAt(5) === "/" &&
      tokens[1].includes(":") &&
      tokens[1].includes(".")
    ) {
      if (["ERROR", "WARN", "DEBUG", "INFO", "TRACE"].includes(tokens[2])) {
        logLevel = tokens[2];
      }
    }

    // Fallback: check if the line starts with any log level
    if (!logLevel) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith("ERROR")) {
        logLevel = "ERROR";
      } else if (trimmedLine.startsWith("WARN")) {
        logLevel = "WARN";
      } else if (trimmedLine.startsWith("DEBUG")) {
        logLevel = "DEBUG";
      } else if (trimmedLine.startsWith("INFO")) {
        logLevel = "INFO";
      } else if (trimmedLine.startsWith("TRACE")) {
        logLevel = "TRACE";
      }
    }

    return logLevel;
  };

  const processLogLines = (content: string) => {
    const lines = content.split("\n");
    const processed: LogLine[] = [];
    let currentLevel = "INFO"; // Default level

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
        isVisible: true,
      });
    });

    return processed;
  };

  const applyFilters = (lines: LogLine[]) => {
    let filteredLines = [];
    const hasActiveFilters = Object.values(filters).some(
      (filter) => filter === true,
    );

    if (!hasActiveFilters) {
      // If no filters are active, hide all lines
      filteredLines = lines.map((line) => ({ ...line, isVisible: false }));
    } else {
      // Only show lines whose level is checked in the filters
      filteredLines = lines.map((line) => ({
        ...line,
        isVisible: !!filters[line.level as keyof typeof filters],
      }));
    }

    return filteredLines;
  };

  const highlightText = (
    text: string,
    searchTerm: string,
    lineIndex: number,
  ) => {
    let result: (string | JSX.Element)[] | string = text;

    if (searchTerm.trim()) {
      const regex = createSearchRegex(searchTerm);

      if (regex) {
        const parts = text.split(regex);
        const matches = text.match(regex);

        if (matches) {
          let matchIndexInLine = 0;
          const highlightedResult = [];

          for (let i = 0; i < parts.length; i++) {
            if (i > 0) {
              const match = matches[i - 1];
              const globalMatchIndex = getGlobalMatchIndex(
                lineIndex,
                matchIndexInLine,
              );
              const isCurrentMatch = globalMatchIndex === currentMatchIndex;
              matchIndexInLine++;

              highlightedResult.push(
                <span
                  key={`match-${i}`}
                  className={`${styles.highlight} ${isCurrentMatch ? styles.currentHighlight : ""}`}
                  id={isCurrentMatch ? "current-match" : undefined}
                >
                  {match}
                </span>,
              );
            }
            if (parts[i]) {
              highlightedResult.push(parts[i]);
            }
          }

          result = highlightedResult;
        }
      }
    }

    return result;
  };

  const getGlobalMatchIndex = (lineIndex: number, matchIndexInLine: number) => {
    let result = -1;

    if (searchTerm.trim()) {
      const visibleLines = processedLines.filter((line) => line.isVisible);
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

      result = globalIndex + matchIndexInLine;
    }

    return result;
  };

  const countMatches = (lines: LogLine[], searchTerm: string) => {
    if (!searchTerm.trim()) return 0;
    const regex = createSearchRegex(searchTerm);
    if (!regex) return 0;

    const visibleContent = lines
      .filter((line) => line.isVisible)
      .map((line) => line.content)
      .join("\n");

    const matches = visibleContent.match(regex);
    return matches ? matches.length : 0;
  };

  const renderLogContent = () => {
    let result: JSX.Element[] | null = null;

    if (processedLines.length) {
      const renderedLines: JSX.Element[] = [];

      processedLines.forEach((logLine, index) => {
        // Only process visible lines
        if (logLine.isVisible) {
          // Apply appropriate class based on log level
          const levelClass = logLine.level.toLowerCase();
          const colorClass = styles[levelClass as keyof typeof styles] || "";

          renderedLines.push(
            <div
              key={logLine.lineNumber}
              className={`${colorClass} ${styles.logEntry}`}
            >
              <span className={styles.lineNumberCol}>
                {logLine.lineNumber}.
              </span>
              <pre>{highlightText(logLine.content, searchTerm, index)}</pre>
            </div>,
          );
        }
      });

      result = renderedLines;
    }

    return result;
  };

  // Scroll to current match
  useEffect(() => {
    if (currentMatchIndex >= 0) {
      const currentMatchElement = document.getElementById("current-match");
      if (currentMatchElement) {
        currentMatchElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
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
      <h3>{translations("title")}</h3>
      <p>{translations("description")}</p>
      <div className={styles.logContainer}>
        <div className={styles.searchContainer}>
          <Search
            placeholder={translations("search_placeholder")}
            size="lg"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {searchTerm && (
            <div className={styles.findControls}>
              <span className={styles.matchCounter} data-testid="match-counter">
                {totalMatches > 0
                  ? translations("match_counter", {
                    current: currentMatchIndex + 1,
                    total: totalMatches,
                  })
                  : translations("no_matches")}
              </span>
              <Button
                kind="ghost"
                size="sm"
                onClick={goToPreviousMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronUp}
                iconDescription={translations("match_previous")}
                hasIconOnly
              />
              <Button
                kind="ghost"
                size="sm"
                onClick={goToNextMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronDown}
                iconDescription={translations("match_next")}
                hasIconOnly
              />
              <Button
                kind={matchCase ? "primary" : "ghost"}
                size="sm"
                onClick={toggleMatchCase}
                renderIcon={CharacterSentenceCase}
                iconDescription={translations("match_case")}
                hasIconOnly
              />
              <Button
                kind={matchWholeWord ? "primary" : "ghost"}
                size="sm"
                onClick={toggleMatchWholeWord}
                renderIcon={TextUnderline}
                iconDescription={translations("match_whole_word")}
                hasIconOnly
              />
            </div>
          )}
        </div>
        <div className={styles.filterBtn}>
          <OverflowMenu
            size="lg"
            iconDescription={translations("filters_menu_title")}
            renderIcon={Filter}
            flipped={true}
          >
            <Checkbox
              id="checkbox-error"
              labelText={translations("filter_error")}
              checked={filters.ERROR}
              onChange={() => handleFilterChange("ERROR")}
            />
            <Checkbox
              id="checkbox-warn"
              labelText={translations("filter_warn")}
              checked={filters.WARN}
              onChange={() => handleFilterChange("WARN")}
            />
            <Checkbox
              id="checkbox-info"
              labelText={translations("filter_info")}
              checked={filters.INFO}
              onChange={() => handleFilterChange("INFO")}
            />
            <Checkbox
              id="checkbox-debug"
              labelText={translations("filter_debug")}
              checked={filters.DEBUG}
              onChange={() => handleFilterChange("DEBUG")}
            />
            <Checkbox
              id="checkbox-trace"
              labelText={translations("filter_trace")}
              checked={filters.TRACE}
              onChange={() => handleFilterChange("TRACE")}
            />
          </OverflowMenu>
        </div>
        <Button
          kind="ghost"
          renderIcon={CloudDownload}
          hasIconOnly
          iconDescription={translations("download_button")}
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
