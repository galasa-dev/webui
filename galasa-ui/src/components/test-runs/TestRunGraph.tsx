/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";

import "@carbon/charts/styles.css";
import { ScatterChart } from "@carbon/charts-react";
import { ScaleTypes } from "@carbon/charts";
import { InlineNotification } from "@carbon/react";
import { SkeletonText } from "@carbon/react";
import {useMemo,useRef, useEffect,} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import styles from "@/styles/TestRunsGraph.module.css";
import { runStructure, ColumnDefinition } from "@/utils/interfaces";
import { MAX_RECORDS } from "@/utils/constants/common";
import { TEST_RUNS } from "@/utils/constants/breadcrumb";
import useHistoryBreadCrumbs from "@/hooks/useHistoryBreadCrumbs";
import { useTheme } from "@/contexts/ThemeContext";
import { getTooltipHTML } from "./TooltipTestRunGraph";
import { useDateTimeFormat } from "@/contexts/DateTimeFormatContext";

interface TestRunGraphProps {
  runsList: runStructure[];
  limitExceeded: boolean;
  visibleColumns?: string[];
  orderedHeaders?: ColumnDefinition[];
  isLoading?: boolean;
  isError?: boolean;
}
const resultColorMap: Record<string, string> = {
  passed:    "#2ecc40", // bright green
  failed:    "#ff4136", // vivid red
  envfail:   "#ffb700", // gold/yellow
  cancelled: "#ab47bc", // medium purple
  requeued:  "#00bcd4", // cyan
  "n/a":     "#bdbdbd", // light gray
  other:     "#607d8b", // blue-gray
};

export default function TestRunGraph({runsList, limitExceeded, visibleColumns=[], orderedHeaders =[], isLoading, isError,}: TestRunGraphProps) {
  const translations = useTranslations("TestRunGraph");
  const themeContext = useTheme();
  const isLightTheme = themeContext?.theme === "light";
  const { formatDate } = useDateTimeFormat();
  

  const router = useRouter();
  const searchParams = useSearchParams();
  const { pushBreadCrumb } = useHistoryBreadCrumbs();

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const headerDefinitions = useMemo(() => {
    if (!runsList.length) return [];
    const firstRun = runsList[0];
    return Object.keys(firstRun)
      .filter((key) => key !== "submittedAt" && key !== "id") // exclude keys you don't want in tooltip
      .map((key) => ({
        key,
        header: translations(key), // or just `key` if translation not available
      }));
  }, [runsList, translations]);



  const chartData = useMemo(() => {
    const dateMap: Record<string, number> = {};
    return runsList.map((run) => {
      const date = new Date(run.submittedAt);
      const dateKey = date.toISOString().split("T")[0];
      const count = (dateMap[dateKey] || 0) + 1;
      dateMap[dateKey] = count;

      return {
        group: (run.result || "other").toLowerCase(),
        date,
        value: count,
        custom: run,
      };
    });
  }, [runsList]);

  const xTickValues = Array.from(
    new Set(runsList.map(run => new Date(run.submittedAt).toISOString().split("T")[0]))
  ).map(dateStr => new Date(dateStr));
  

  const chartOptions = useMemo(() => ({
    theme: isLightTheme ? "white" : "g100",
    axes: {
      bottom: {
        title: translations("submittedAt"),
        mapsTo: "date",
        scaleType: ScaleTypes.TIME,
        ticks: {
          values: xTickValues,
          formatter: (tick: number | Date, i?: number) => {
            const date = tick instanceof Date ? tick : new Date(tick);
            const day = date.getDate();
            const month = date.toLocaleString("default", { month: "short" });
            if (day === 30) {
              return `${month} ${day}`;
            }
            return `${day}`;
          },
          rotateIfSmallerThan: 60,
        
        }},
        
      left: {
        title: "",
        mapsTo: "value",
        scaleType: ScaleTypes.LINEAR,
        visible: false,
      },
    },
    height: "400px",
    points: { radius: 4, fillOpacity: 1 },
    color: { scale: resultColorMap },
    zoomBar: {
      top: {
        enabled: true
      },
    },
    animations: false,
    tooltip: {
      enabled: true,
      customHTML: (points: any[]) => getTooltipHTML(points, headerDefinitions, styles),
    },
    legend: { alignment: "center" },
    data: { loading: isLoading },
    toolbar: { enabled: false },
    experimental: true,
  }),[headerDefinitions, isLoading, isLightTheme,translations]);

  // Carbon Charts does not expose a direct onClick handler for data points.
  // Therefore, we manually attach a click event listener to the chart container.
  // The handler traverses the DOM from the event target upwards to find an element with a __data__ property,
  // which contains the chart's data point object. This allows us to extract the clicked run and perform navigation.
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
        <SkeletonText width="100%" style={{ height: 400 }} />
      </div>
    );
  if (!runsList.length) return <p>{translations("noTestRunsFound")}</p>;
  const dates = runsList.map((run) =>
    new Date(run.submittedAt || 0).getTime(),
  );

  const earliestDate = new Date(Math.min(...dates));
  const latestDate = new Date(Math.max(...dates));

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
          from: formatDate(earliestDate),
          to: formatDate(latestDate)
        })}
      </p>
      <div ref={chartContainerRef}>
        <ScatterChart data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}