/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

import { AmPm } from '../types/common';

/**
 * Component-specific prop interfaces
 */

export interface DateTimePickerProps {
  legend: string;
  date: Date;
  time: string;
  amPm: AmPm;
  onDateChange: (date: Date | null) => void;
  onTimeChange: (time: string) => void;
  onAmPmChange: (amPm: AmPm) => void;
}

export interface BreadCrumbProps {
  title: string;
  route: string;
}
