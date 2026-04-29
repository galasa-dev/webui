/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
'use client';

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Search, OverflowMenu, Button, InlineNotification } from '@carbon/react';
import styles from '@/styles/test-runs/test-run-details/LogTab.module.css';
import { Checkbox } from '@carbon/react';
import {
  Filter,
  ChevronUp,
  ChevronDown,
  CloudDownload,
  Term,
  LetterAa,
  Copy,
  Renew,
  UpToTop,
  DownToBottom,
} from '@carbon/icons-react';
import { handleDownload } from '@/utils/artifacts';
import { useTranslations } from 'next-intl';
import { fetchRunLog } from '@/actions/runsAction';
import { NotificationType } from '@/utils/types/common';
import { NOTIFICATION_VISIBLE_MILLISECS } from '@/utils/constants/common';
import { InlineLoading } from '@carbon/react';

interface LogLine {
  content: string;
  level: string;
  lineNumber: number;
  isVisible: boolean;
}

interface MatchInfo {
  lineIndex: number;
  start: number;
  end: number;
  globalIndex: number;
}

enum RegexFlags {
  AllMatches = 'g',
  AllMatchesIgnoreCase = 'gi',
}

interface LogTabProps {
  logs: string;
  initialLine?: number;
  runId: string;
  isLoadingLogs?: boolean;
  logsError?: string | null;
}

interface selectedRange {
  startLine: number;
  endLine: number;
  startOffset: number;
  endOffset: number;
}

const SELECTION_CHANGE_EVENT = 'selectionchange';
const HASH_CHANGE_EVENT = 'hashchange';

const LINE_HEIGHT_PIXELS = 24;
const MIN_VISIBLE_LINES = 100;

// Number of lines to render above/below viewport
const VIEWPORT_LINE_BUFFER_SIZE = 50;

export default function LogTab({
  logs,
  initialLine,
  runId,
  isLoadingLogs,
  logsError,
}: LogTabProps) {
  const translations = useTranslations('LogTab');

  const [logContent, setLogContent] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [processedLines, setProcessedLines] = useState<LogLine[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
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
  const [selectedRange, setSelectedRange] = useState<selectedRange | null>(null);
  const [isAtTop, setIsAtTop] = useState<boolean>(true);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);

  // Virtual scrolling state
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: MIN_VISIBLE_LINES });

  // Cache for search results to avoid recomputation
  const [searchCache, setSearchCache] = useState<Map<string, MatchInfo[]>>(new Map());

  // Cache for highlight results
  const highlightCache = useRef<Map<string, React.ReactNode>>(new Map());

  // State to track the URL hash, initialized to the value of the first render
  const [currentHash, setCurrentHash] = useState<string>(
    typeof window !== 'undefined' ? window.location.hash : ''
  );

  const logContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [notification, setNotification] = useState<NotificationType | null>(null);

  const DEBOUNCE_DELAY_MILLISECONDS = 300;
  const ANIMATION_BEHAVIOUR = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'instant'
    : 'smooth';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value || '';
    setSearchTerm(value);

    // Clear any existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set a new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(value);
      if (!value.trim()) {
        setCurrentMatchIndex(-1);
        setTotalMatches(0);
      }
    }, DEBOUNCE_DELAY_MILLISECONDS);
  };

  const handleFilterChange = (level: string) => {
    setFilters((prev) => ({
      ...prev,
      [level]: !prev[level as keyof typeof prev],
    }));
  };

  const handleCopyPermalink = () => {
    if (!selectedRange) return;

    // Use the stored logical start/end from the state
    const { startLine, endLine, startOffset, endOffset } = selectedRange;

    // Construct the base URL from its parts to explicitly exclude any existing hash
    const baseUrl = window.location.origin + window.location.pathname + window.location.search;

    // Build the URL without the 'line' parameter
    const urlWithoutLines = new URL(baseUrl);
    urlWithoutLines.searchParams.delete('line');

    // Construct the permalink
    const permalink = `${urlWithoutLines.toString()}#log-${startLine}-${startOffset}-${endLine}-${endOffset}`;

    navigator.clipboard.writeText(permalink);

    // Clear selection after copying
    setSelectedRange(null);
  };

  const toggleMatchCase = () => {
    setMatchCase(!matchCase);

    // Clear caches when search options change
    setSearchCache(new Map());
    highlightCache.current.clear();
  };

  const toggleMatchWholeWord = () => {
    setMatchWholeWord(!matchWholeWord);

    // Clear caches when search options change
    setSearchCache(new Map());
    highlightCache.current.clear();
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

  const handleRefreshLog = async () => {
    setIsRefreshing(true);

    try {
      // Fetch fresh log from the server
      const newRunLog = await fetchRunLog(runId);

      setLogContent(newRunLog);
    } catch (error: unknown) {
      console.error('Error refreshing logs:', error);
      setNotification?.({
        kind: 'error',
        title: translations('errorTitle'),
        subtitle: translations('errorFailedMessage', {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        }),
      });
      setTimeout(() => setNotification(null), NOTIFICATION_VISIBLE_MILLISECS);

      // Fallback to existing logs if fetch fails
      setLogContent(logs);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate which lines should be visible based on scroll position
  const calculateVisibleRange = useCallback(
    (scrollTop: number, containerHeight: number, totalLines: number) => {
      const startLine = Math.floor(scrollTop / LINE_HEIGHT_PIXELS);
      const endLine = Math.ceil((scrollTop + containerHeight) / LINE_HEIGHT_PIXELS);

      // Add buffer above and below
      const start = Math.max(0, startLine - VIEWPORT_LINE_BUFFER_SIZE);
      const end = Math.min(totalLines, endLine + VIEWPORT_LINE_BUFFER_SIZE);

      return { start, end };
    },
    []
  );

  const checkScrollPosition = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const THRESHOLD_PIXELS = 40;

      setIsAtTop(scrollTop <= THRESHOLD_PIXELS);
      setIsAtBottom(scrollTop + clientHeight >= scrollHeight - THRESHOLD_PIXELS);
    }
  }, []);

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      // First update the visible range to include top lines
      setVisibleRange({ start: 0, end: Math.min(MIN_VISIBLE_LINES, visibleLines.length) });

      // Wait for React to render the new range, then scroll
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: ANIMATION_BEHAVIOUR,
          });
        }
      });
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      const maxScroll = visibleLines.length * LINE_HEIGHT_PIXELS;
      const container = scrollContainerRef.current;

      // First calculate and set the visible range for bottom lines
      const newRange = calculateVisibleRange(
        maxScroll,
        container.clientHeight,
        visibleLines.length
      );
      setVisibleRange(newRange);

      // Wait for React to render the new range, then scroll
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: maxScroll,
            behavior: ANIMATION_BEHAVIOUR,
          });
        }
      });
    }
  };

  // Memoized regex creation to avoid recreating the same regex repeatedly
  const searchRegex = useMemo(() => {
    let regex: RegExp | null = null;

    if (debouncedSearchTerm.trim()) {
      let escapedTerm = debouncedSearchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (matchWholeWord) {
        escapedTerm = `\\b${escapedTerm}\\b`;
      }
      const flags = matchCase ? RegexFlags.AllMatches : RegexFlags.AllMatchesIgnoreCase;
      regex = new RegExp(escapedTerm, flags);
    }

    return regex;
  }, [debouncedSearchTerm, matchCase, matchWholeWord]);

  const getLogLevel = (line: string) => {
    let logLevel: string | null = null;

    // Attempt to parse a timestamp and log level by splitting the line.
    const tokens = line.trim().split(' ');
    if (
      tokens.length >= 3 &&
      tokens[0].length === 10 && // Simple check for DD/MM/YYYY format
      tokens[0].charAt(2) === '/' &&
      tokens[0].charAt(5) === '/' &&
      tokens[1].includes(':') &&
      tokens[1].includes('.')
    ) {
      if (['ERROR', 'WARN', 'DEBUG', 'INFO', 'TRACE'].includes(tokens[2])) {
        logLevel = tokens[2];
      }
    }

    // Fallback: check if the line starts with any log level
    if (!logLevel) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('ERROR')) {
        logLevel = 'ERROR';
      } else if (trimmedLine.startsWith('WARN')) {
        logLevel = 'WARN';
      } else if (trimmedLine.startsWith('DEBUG')) {
        logLevel = 'DEBUG';
      } else if (trimmedLine.startsWith('INFO')) {
        logLevel = 'INFO';
      } else if (trimmedLine.startsWith('TRACE')) {
        logLevel = 'TRACE';
      }
    }

    return logLevel;
  };

  // Search function that computes all matches once and caches results
  const computeSearchMatches = useCallback(
    (lines: LogLine[], regex: RegExp | null): MatchInfo[] => {
      let result: MatchInfo[] = [];

      if (!regex || !debouncedSearchTerm.trim()) {
        result = [];
      } else {
        try {
          // Create cache key
          const cacheKey = `${debouncedSearchTerm}-${matchCase}-${matchWholeWord}-${lines.map((l) => l.isVisible).join('')}`;

          // Check cache first
          if (searchCache.has(cacheKey)) {
            result = searchCache.get(cacheKey)!;
          } else {
            const matches: MatchInfo[] = [];
            let globalIndex = 0;

            lines.forEach((line, lineIndex) => {
              if (!line.isVisible) return;

              // Reset regex lastIndex to ensure we get all matches
              regex.lastIndex = 0;
              let match;

              while ((match = regex.exec(line.content)) !== null) {
                matches.push({
                  lineIndex,
                  start: match.index,
                  end: match.index + match[0].length,
                  globalIndex: globalIndex++,
                });

                // Prevent infinite loop on zero-length matches
                if (match.index === regex.lastIndex) {
                  regex.lastIndex++;
                }
              }
            });

            // Cache the results
            setSearchCache((prev) => new Map(prev).set(cacheKey, matches));
            result = matches;
          }
        } catch (error) {
          console.warn('Regex execution error:', error);
          result = [];
        }
      }

      return result;
    },
    [debouncedSearchTerm, matchCase, matchWholeWord, searchCache]
  );

  const searchMatches = useMemo(() => {
    return computeSearchMatches(processedLines, searchRegex);
  }, [processedLines, searchRegex, computeSearchMatches]);

  // Clear highlight cache when search changes
  useEffect(() => {
    highlightCache.current.clear();
  }, [debouncedSearchTerm, matchCase, matchWholeWord]);

  const highlightText = useCallback(
    (text: string, lineIndex: number): React.ReactNode => {
      // Check cache first
      const cacheKey = `${lineIndex}-${text}-${currentMatchIndex}`;

      if (highlightCache.current.has(cacheKey)) {
        return highlightCache.current.get(cacheKey);
      }

      let result: React.ReactNode = text;

      if (searchRegex && debouncedSearchTerm.trim()) {
        const lineMatches = searchMatches.filter((match) => match.lineIndex === lineIndex);

        if (lineMatches.length > 0) {
          const resultArray: React.ReactNode[] = [];
          let lastEnd = 0;

          lineMatches.forEach((match, matchIndex) => {
            // Add text before match
            if (match.start > lastEnd) {
              resultArray.push(text.substring(lastEnd, match.start));
            }

            // Add highlighted match
            const isCurrentMatch = match.globalIndex === currentMatchIndex;
            const matchText = text.substring(match.start, match.end);

            resultArray.push(
              <span
                key={`match-${lineIndex}-${matchIndex}`}
                className={`${styles.highlight} ${isCurrentMatch ? styles.currentHighlight : ''}`}
                id={isCurrentMatch ? 'current-match' : undefined}
              >
                {matchText}
              </span>
            );

            lastEnd = match.end;
          });

          // Add remaining text after last match
          if (lastEnd < text.length) {
            resultArray.push(text.substring(lastEnd));
          }

          result = resultArray;
        }
      }

      // Cache the result
      highlightCache.current.set(cacheKey, result);
      return result;
    },
    [searchRegex, debouncedSearchTerm, searchMatches, currentMatchIndex]
  );

  const visibleLines = useMemo(() => {
    return processedLines.filter((line) => line.isVisible);
  }, [processedLines]);

  // Handle scroll events with throttling for virtual scrolling
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const SCROLL_TIMEOUT_DELAY = 16;
      const SCROLL_RANGE_DIFFERENCE_LIMIT = 10;

      const target = e.currentTarget;
      const newScrollTop = target.scrollTop;

      // Throttle range updates
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const newRange = calculateVisibleRange(
          newScrollTop,
          target.clientHeight,
          visibleLines.length
        );

        // Only update if range changed significantly (avoid excessive re-renders)
        if (
          Math.abs(newRange.start - visibleRange.start) > SCROLL_RANGE_DIFFERENCE_LIMIT ||
          Math.abs(newRange.end - visibleRange.end) > SCROLL_RANGE_DIFFERENCE_LIMIT
        ) {
          setVisibleRange(newRange);
        }
      }, SCROLL_TIMEOUT_DELAY);

      checkScrollPosition();
    },
    [calculateVisibleRange, visibleRange, checkScrollPosition, visibleLines.length]
  );

  const renderLogContent = () => {
    if (visibleLines.length === 0) return null;

    // Calculate total height of virtual container
    const totalHeight = visibleLines.length * LINE_HEIGHT_PIXELS;

    // Get only the lines that should be rendered (visible range)
    const linesToRender = visibleLines.slice(visibleRange.start, visibleRange.end);

    return (
      <div
        className={styles.virtualScrollContainer}
        style={{
          height: `${totalHeight}px`,
        }}
      >
        {linesToRender.map((logLine, index) => {
          const actualIndex = visibleRange.start + index;
          const levelClass = logLine.level.toLowerCase();
          const colorClass = styles[levelClass as keyof typeof styles] || '';

          const isLineSelected =
            selectedRange &&
            logLine.lineNumber >= selectedRange.startLine &&
            logLine.lineNumber <= selectedRange.endLine;

          // Calculate absolute position for this line
          const topPosition = actualIndex * LINE_HEIGHT_PIXELS;

          return (
            <div
              key={logLine.lineNumber}
              id={`log-line-${logLine.lineNumber}`}
              className={`${colorClass} ${styles.logEntry} ${isLineSelected ? styles.lineSelected : ''}`}
              style={{
                top: `${topPosition}px`,
                height: `${LINE_HEIGHT_PIXELS}px`,
              }}
            >
              <span className={styles.lineNumberCol}>{logLine.lineNumber}.</span>
              <pre>{highlightText(logLine.content, processedLines.indexOf(logLine))}</pre>
            </div>
          );
        })}
      </div>
    );
  };

  // Effect to select/deselect lines based on user selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selected = window.getSelection();

      // Ignore if no selection or just a single click
      if (!selected || selected.isCollapsed) {
        setSelectedRange(null);
        return;
      }

      // Set the selection state with start and end lines
      const startLineEl = selected.anchorNode?.parentElement?.closest('[id^="log-line-"]');
      const endLineEl = selected.focusNode?.parentElement?.closest('[id^="log-line-"]');

      if (startLineEl && endLineEl) {
        const anchorLineNum = parseInt(startLineEl.id.split('-')[2]);
        const focusLineNum = parseInt(endLineEl.id.split('-')[2]);

        // Determine the true start/end regardless of selection direction
        const isSelectingForward =
          anchorLineNum < focusLineNum ||
          (anchorLineNum === focusLineNum && selected.anchorOffset <= selected.focusOffset);

        const startLine = isSelectingForward ? anchorLineNum : focusLineNum;
        const endLine = isSelectingForward ? focusLineNum : anchorLineNum;
        const startOffset = isSelectingForward ? selected.anchorOffset : selected.focusOffset;
        const endOffset = isSelectingForward ? selected.focusOffset : selected.anchorOffset;

        setSelectedRange({ startLine, endLine, startOffset, endOffset });
      }
    };

    document.addEventListener(SELECTION_CHANGE_EVENT, handleSelectionChange);

    return () => {
      document.removeEventListener(SELECTION_CHANGE_EVENT, handleSelectionChange);
    };
  }, []);

  // Effect to listen to the browser hash changes and updates the state that runs only on mount
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };

    window.addEventListener(HASH_CHANGE_EVENT, handleHashChange);
    return () => {
      window.removeEventListener(HASH_CHANGE_EVENT, handleHashChange);
    };
  }, []);

  // Effect to scroll to selected lines
  useEffect(() => {
    // Exit if logs aren't processed
    if (processedLines.length === 0) {
      return;
    }

    const hash = currentHash || window.location.hash;

    // Check for a line range in the URL hash
    if (hash.startsWith('#log-')) {
      const parts = hash.substring(5).split('-');
      if (parts.length === 4) {
        const [startLine, startOffset, endLine, endOffset] = parts.map((p) => parseInt(p, 10));

        if (![startLine, startOffset, endLine, endOffset].some(isNaN)) {
          // Set the selection state
          setSelectedRange({ startLine, startOffset, endLine, endOffset });

          // Find the elements and text nodes to create the selection
          const startElement = document.getElementById(`log-line-${startLine}`);
          const endElement = document.getElementById(`log-line-${endLine}`);
          const startNode = startElement?.querySelector('pre')?.firstChild;
          const endNode = endElement?.querySelector('pre')?.firstChild;

          if (startNode && endNode) {
            // Validate offsets
            const validStartOffset = Math.min(startOffset, startNode.textContent?.length || 0);
            const validEndOffset = Math.min(endOffset, endNode.textContent?.length || 0);

            // Create the highlighted range
            const range = document.createRange();
            range.setStart(startNode, validStartOffset);
            range.setEnd(endNode, validEndOffset);

            // Override any existing selection
            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }

            startElement.scrollIntoView({ behavior: 'auto', block: 'center' });
          }
        }
      }
    }
  }, [processedLines, currentHash]);

  // Initialize visible range when component loads
  useEffect(() => {
    if (scrollContainerRef.current && visibleLines.length > 0) {
      const containerHeight = scrollContainerRef.current.clientHeight;
      const initialRange = calculateVisibleRange(0, containerHeight, visibleLines.length);
      setVisibleRange(initialRange);
    }
  }, [visibleLines.length, calculateVisibleRange]);

  // Effect to scroll to the initial line with virtual scrolling
  useEffect(() => {
    if (initialLine && processedLines.length > 0 && scrollContainerRef.current) {
      const lineIndex = visibleLines.findIndex((line) => line.lineNumber === initialLine - 1);

      if (lineIndex !== -1) {
        const targetScrollTop = lineIndex * LINE_HEIGHT_PIXELS;

        scrollContainerRef.current.scrollTo({
          top: targetScrollTop,
          behavior: ANIMATION_BEHAVIOUR,
        });

        // Update visible range
        const newRange = calculateVisibleRange(
          targetScrollTop,
          scrollContainerRef.current.clientHeight,
          visibleLines.length
        );
        setVisibleRange(newRange);
      }
    }
  }, [ANIMATION_BEHAVIOUR, initialLine, processedLines, visibleLines, calculateVisibleRange]);

  // Scroll to current match with virtual scrolling
  useEffect(() => {
    if (currentMatchIndex >= 0 && searchMatches.length > 0 && scrollContainerRef.current) {
      const match = searchMatches[currentMatchIndex];
      const matchLineIndex = visibleLines.findIndex(
        (line) => processedLines.indexOf(line) === match.lineIndex
      );

      if (matchLineIndex !== -1) {
        // Calculate scroll position to center the match
        const targetScrollTop =
          matchLineIndex * LINE_HEIGHT_PIXELS - scrollContainerRef.current.clientHeight / 2;

        scrollContainerRef.current.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: ANIMATION_BEHAVIOUR,
        });

        // Update visible range immediately
        const newRange = calculateVisibleRange(
          Math.max(0, targetScrollTop),
          scrollContainerRef.current.clientHeight,
          visibleLines.length
        );
        setVisibleRange(newRange);
      }
    }
  }, [
    ANIMATION_BEHAVIOUR,
    currentMatchIndex,
    searchMatches,
    visibleLines,
    processedLines,
    calculateVisibleRange,
  ]);

  useEffect(() => {
    const matchCount = searchMatches.length;
    setTotalMatches(matchCount);

    if (matchCount > 0 && currentMatchIndex === -1) {
      setCurrentMatchIndex(0);
    } else if (matchCount === 0) {
      setCurrentMatchIndex(-1);
    } else if (currentMatchIndex >= matchCount) {
      setCurrentMatchIndex(matchCount - 1);
    }
  }, [searchMatches, currentMatchIndex, debouncedSearchTerm]);

  // Process log content progressively and apply filters
  useEffect(() => {
    if (!logContent) return;

    const processLogsProgressively = () => {
      const lines = logContent.split('\n');
      let currentIndex = 0;
      const processed: LogLine[] = [];
      let currentLevel = 'INFO'; // Default level

      const MAX_IDLE_TIME_MS = 50;
      const processChunk = (deadline: IdleDeadline) => {
        // Process as many lines as we can in this idle period
        const startTime = performance.now();

        while (
          currentIndex < lines.length &&
          (deadline.timeRemaining() > 0 || performance.now() - startTime < MAX_IDLE_TIME_MS)
        ) {
          const line = lines[currentIndex];
          const detectedLevel = getLogLevel(line);

          if (detectedLevel) {
            currentLevel = detectedLevel;
          }

          processed.push({
            content: line,
            level: currentLevel,
            lineNumber: currentIndex + 1,
            isVisible: true,
          });

          currentIndex++;
        }

        if (currentIndex < lines.length) {
          // More work to do, schedule next chunk
          requestIdleCallback(processChunk, { timeout: 1000 });
        } else {
          // Processing complete, apply filters
          const hasActiveFilters = Object.values(filters).some((filter) => filter === true);

          const filtered = hasActiveFilters
            ? processed.map((line) => ({
                ...line,
                isVisible: !!filters[line.level as keyof typeof filters],
              }))
            : processed.map((line) => ({ ...line, isVisible: false }));

          setProcessedLines(filtered);
        }
      };

      // Start processing
      requestIdleCallback(processChunk, { timeout: 1000 });
    };

    processLogsProgressively();
  }, [logContent, filters]);

  // Clear cache when filters change
  useEffect(() => {
    setSearchCache(new Map());
  }, [filters]);

  useEffect(() => {
    setLogContent(logs);
  }, [logs]);

  // Cleanup the timeout on component unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Track scroll position in log tab
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Check initial position
    checkScrollPosition();

    // Add scroll event listener
    scrollContainer.addEventListener('scroll', checkScrollPosition);

    return () => {
      scrollContainer.removeEventListener('scroll', checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // Re-check scroll position when content changes
  useEffect(() => {
    checkScrollPosition();
  }, [processedLines, checkScrollPosition]);

  const copyPermalinkText = selectedRange?.startLine
    ? translations('copyPermalinkButton')
    : translations('selectLinesToCreatePermalink');

  return (
    <div>
      <h3>{translations('title')}</h3>
      <p>{translations('description')}</p>

      {logsError && (
        <InlineNotification
          kind="error"
          title={translations('errorTitle')}
          subtitle={logsError}
          hideCloseButton={false}
          onClose={() => {}}
          className={styles.notification}
        />
      )}
      <div className={styles.logContainer}>
        <div className={styles.searchContainer}>
          <Search
            placeholder={translations('searchPlaceholder')}
            size="lg"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          {debouncedSearchTerm && (
            <div className={styles.findControls}>
              <span className={styles.matchCounter} data-testid="match-counter">
                {totalMatches > 0
                  ? translations('matchCounter', {
                      current: currentMatchIndex + 1,
                      total: totalMatches,
                    })
                  : translations('noMatches')}
              </span>
              <Button
                kind="ghost"
                size="sm"
                onClick={goToPreviousMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronUp}
                iconDescription={translations('matchPrevious')}
                hasIconOnly
              />
              <Button
                kind="ghost"
                size="sm"
                onClick={goToNextMatch}
                disabled={totalMatches === 0}
                renderIcon={ChevronDown}
                iconDescription={translations('matchNext')}
                hasIconOnly
              />
              <Button
                kind={matchCase ? 'primary' : 'ghost'}
                size="sm"
                onClick={toggleMatchCase}
                renderIcon={LetterAa}
                iconDescription={translations('matchCase')}
                hasIconOnly
              />
              <Button
                kind={matchWholeWord ? 'primary' : 'ghost'}
                size="sm"
                onClick={toggleMatchWholeWord}
                renderIcon={Term}
                iconDescription={translations('matchWholeWord')}
                hasIconOnly
              />
            </div>
          )}
        </div>
        <div className={styles.filterBtn}>
          <OverflowMenu
            size="lg"
            iconDescription={translations('filtersMenuTitle')}
            renderIcon={Filter}
            flipped={true}
          >
            <Checkbox
              id="checkbox-error"
              labelText={translations('filterError')}
              checked={filters.ERROR}
              onChange={() => handleFilterChange('ERROR')}
            />
            <Checkbox
              id="checkbox-warn"
              labelText={translations('filterWarn')}
              checked={filters.WARN}
              onChange={() => handleFilterChange('WARN')}
            />
            <Checkbox
              id="checkbox-info"
              labelText={translations('filterInfo')}
              checked={filters.INFO}
              onChange={() => handleFilterChange('INFO')}
            />
            <Checkbox
              id="checkbox-debug"
              labelText={translations('filterDebug')}
              checked={filters.DEBUG}
              onChange={() => handleFilterChange('DEBUG')}
            />
            <Checkbox
              id="checkbox-trace"
              labelText={translations('filterTrace')}
              checked={filters.TRACE}
              onChange={() => handleFilterChange('TRACE')}
            />
          </OverflowMenu>
        </div>
        <Button
          kind="ghost"
          renderIcon={CloudDownload}
          hasIconOnly
          iconDescription={translations('downloadButton')}
          onClick={() => handleDownload(logContent, 'run.log')}
        />
        <Button
          kind="ghost"
          renderIcon={Copy}
          hasIconOnly
          aria-label={copyPermalinkText}
          iconDescription={copyPermalinkText}
          onClick={selectedRange?.startLine ? handleCopyPermalink : undefined}
          className={!selectedRange?.startLine ? styles.buttonDisabled : ''}
          data-testid="icon-button-copy-permalink"
        />
        <Button
          kind="ghost"
          renderIcon={Renew}
          hasIconOnly
          iconDescription={translations('refreshRunLog')}
          onClick={handleRefreshLog}
          disabled={isRefreshing}
        />
      </div>
      <div className={styles.runLogWrapper}>
        {isLoadingLogs && <InlineLoading description={translations('loading_logs')} />}
        {!isAtTop && (
          <div className={styles.jumpToTopContainer}>
            <Button
              kind="ghost"
              renderIcon={UpToTop}
              hasIconOnly
              iconDescription={translations('jumpToTop')}
              onClick={scrollToTop}
            />
          </div>
        )}
        <div className={styles.runLog} ref={scrollContainerRef} onScroll={handleScroll}>
          <div className={styles.runLogContent} ref={logContainerRef}>
            {renderLogContent()}
          </div>
        </div>
        {!isAtBottom && (
          <div className={styles.jumpToBottomContainer}>
            <Button
              kind="ghost"
              renderIcon={DownToBottom}
              hasIconOnly
              iconDescription={translations('jumpToBottom')}
              onClick={scrollToBottom}
            />
          </div>
        )}
      </div>

      {notification && (
        <InlineNotification
          kind={notification.kind}
          title={notification.title}
          subtitle={notification.subtitle}
          onClose={() => setNotification(null)}
          hideCloseButton={false}
          className={styles.notification}
        />
      )}
    </div>
  );
}
