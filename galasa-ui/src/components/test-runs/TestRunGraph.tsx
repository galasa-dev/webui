/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";

import "@carbon/charts/styles.css";
import { ScatterChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import { Loading, InlineNotification } from "@carbon/react";
import {useMemo,useRef, useEffect,} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "@/styles/TestRunsGraph.module.css";
import { runStructure, ColumnDefinition } from "@/utils/interfaces";
import { MAX_RECORDS } from "@/utils/constants/common";
import { TEST_RUNS } from "@/utils/constants/breadcrumb";
import useHistoryBreadCrumbs from "@/hooks/useHistoryBreadCrumbs";
import { useTheme } from "@/contexts/ThemeContext";

interface TestRunGraphProps {
  runsList: runStructure[];
  limitExceeded: boolean;
  visibleColumns?: string[];
  orderedHeaders?: ColumnDefinition[];
  isLoading?: boolean;
  isError?: boolean;
}

export default function TestRunGraph({runsList, limitExceeded, visibleColumns=[], orderedHeaders =[], isLoading, isError,}: TestRunGraphProps) {
  const translations = useTranslations("TestRunGraph");
  const themeContext = useTheme();
  const isLightTheme = themeContext?.theme === "light";

  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushBreadCrumb } = useHistoryBreadCrumbs();

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const headerDefinitions = useMemo(() => {
    if (orderedHeaders.length && visibleColumns.length) {
      return orderedHeaders
        .filter(({ id }) => visibleColumns.includes(id))
        .map(({ id }) => ({ key: id, header: translations(id) }));
    }
    return visibleColumns.map((columnId) => ({
      key: columnId,
      header: translations(columnId),
    }));
  }, [orderedHeaders, visibleColumns, translations]);

  const resultColorMap: Record<string, string> = {
    passed: "#24a148",
    failed: "#e53935",
  };

  const chartData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    return runsList.map((run) => {
      const date = new Date(run.submittedAt);
      const dateKey = date.toISOString().split("T")[0];
      const count = (dateMap[dateKey] || 0) + 1;
      dateMap[dateKey] = count;

      return {
        group: (run.result || "other").toLowerCase(),
        date: date,
        value: count,
        custom: run,
      };
    });
  }, [runsList]);

  const chartOptions = useMemo(() => ({
    theme: isLightTheme ? "white" : "g100",
    axes: {
      bottom: {
        title: translations("submittedAt"),
        mapsTo: "date",
        scaleType: ScaleTypes.TIME,
      },
      left: {
        title: "",
        mapsTo: "value",
        scaleType: ScaleTypes.LINEAR,
        visible: false,
      },
    },
    height: "400px",
    points: { radius: 5, fillOpacity: 1 },
    color: { scale: resultColorMap },
    tooltip: {
      enabled: true,
      customHTML: (points: any[]) => {
        const run = points[0]?.custom || {};
        return `
            <div style="padding:6px; font-size:0.9rem;">
              ${headerDefinitions.map(({ key, header }) =>
      `<strong>${header}:</strong> ${run[key] ?? "Unknown"}`
    ).join("<br/>")}
            </div>`;
      },
    },
    legend: { alignment: "center" },
    data: { loading: isLoading },
    toolbar: { enabled: false },
    experimental: true,
  }),[headerDefinitions, isLoading, isLightTheme]);

  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    const handleClick = (event: MouseEvent) => {
      let element = event.target as HTMLElement | null;
      while (element && !(element as any).__data__) {
        element = element.parentElement;
      }
      const dataPoint = element && (element as any).__data__;
      if (!dataPoint?.custom) return;

      const selectedRun = dataPoint.custom as runStructure;
      if (!selectedRun.id) return;

      pushBreadCrumb({
        ...TEST_RUNS,
        route: `/test-runs?${searchParams.toString()}`,
      });
      router.push(`/test-runs/${selectedRun.id}`);
    };

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [chartData, pushBreadCrumb, router, searchParams]);

  if (isError) return <p>{translations("errorLoadingGraph")}</p>;
  if (isLoading)
    return (
      <div className={styles.spinnerWrapper}>
        <Loading withOverlay={false} description={translations("loadingGraph")} />
      </div>
    );
  if (!runsList.length) return <p>{translations("noTestRunsFound")}</p>;

  // Compute timeframe text
  const earliestDate = new Date(
    Math.min(...runsList.map((r) => new Date(r.submittedAt).getTime()))
  );
  const latestDate = new Date(
    Math.max(...runsList.map((r) => new Date(r.submittedAt).getTime()))
  );

  return (
    <div className={styles.resultsPageContainer}>
      {limitExceeded && (
        <InlineNotification
          kind="warning"
          title={translations("limitExceeded.title")}
          subtitle={translations("limitExceeded.subtitle", { MAX_RECORDS })}
          className={styles.notification}
        />
      )}
      <p className={styles.timeFrameText}>
        {translations("timeFrameText.range", {
          from: earliestDate.toLocaleString().replace(",", ""),
          to: latestDate.toLocaleString().replace(",", ""),
        })}
      </p>
      <div ref={chartContainerRef}>
        <ScatterChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
