/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */

'use client';

import React, { useTransition } from "react";
import { Dropdown } from "@carbon/react";
import styles from "@/styles/Selector.module.css"; 
import { useTheme } from "@/contexts/ThemeContext";

type ThemeType = "white" | "g100"; 

const themes = [
  { id: "white", text: "White", value: "white" },
  { id: "g100", text: "Dark", value: "g100" },
];

export default function ThemeSelector() {

  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const selectedItem = themes.find((t) => t.value === theme) || themes[0];
  
  const handleThemeChange = ({ selectedItem }: { selectedItem: { id: string; text: string; value: string } }) => {
    if (!selectedItem) return;
    startTransition(() => {
      setTheme(selectedItem.value as ThemeType); 
    });
  };


  return (
    <div className={styles.container}>
      <span className={styles.icon}>Theme :</span>
      <Dropdown
        id="theme-selector"
        items={themes}
        onChange={handleThemeChange}
        selectedItem={selectedItem}
        label="Select theme"
        itemToString={(item: { id: string; text: string; value: string } | null) => item?.text || ""}
        size="sm"
        className={styles.dropdown}
        disabled={isPending}
      />
    </div>
  );
}
