/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
export function getTooltipHTML(points: any[], headerDefinitions: { key: string, header: string }[], styles: any) {
  const run = points[0]?.custom || {};
  return `
    <div class="${styles.tooltipContent}">
      ${headerDefinitions.map(({ key, header }) =>
    `<strong>${header}:</strong> ${run[key] ?? "Unknown"}`
  ).join("<br/>")}
    </div>`;
} 