/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import styles from "@/styles/TestRunsPage.module.css";
import { Button, Search } from "@carbon/react";
import { FormEvent, useMemo, useState } from "react";

interface CustomSearchComponentProps {
    title: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
    allRequestors?: string[]; 
  }
  

export default function CustomSearchComponent({title, placeholder, value, onChange, onClear, onSubmit, onCancel, allRequestors}: CustomSearchComponentProps) {
    const [isListVisible, setIsListVisible] = useState(false);
  
    const filteredRequestors = useMemo(() => {
      let currentRequestors = allRequestors || [];
      
      if (value && currentRequestors.length > 0) {
        currentRequestors = currentRequestors?.filter((name: string) => name.toLowerCase().includes(value.toLowerCase()));
      }
  
      return currentRequestors;
    }, [value, allRequestors]);
  
    const handleSelectRequestor = (name: string) => {
      onChange({ target: { value: name } } as React.ChangeEvent<HTMLInputElement>);
      setIsListVisible(false);
    }
  
    return (
      <form className={styles.filterInputContainer} onSubmit={onSubmit}>
        <div className={styles.customComponentWrapper}>
          <p>{title}</p>
          <div className={styles.suggestionContainer}>
          <Search
            id="search-input"
            placeholder={placeholder}
            size="md"
            type="text"
            value={value}
            onChange={onChange}
            onClear={onClear}
            onFocus={() => allRequestors && setIsListVisible(true)}
            onBlur={() => setTimeout(() => setIsListVisible(false), 100)} //
          />
          {allRequestors && isListVisible && filteredRequestors.length > 0 && (
            <ul className={styles.suggestionList}>
              {filteredRequestors.map((name: string) => (
                <li key={name} onMouseDown={() => handleSelectRequestor(name)}>
                  {name}
                </li>
              ))}
            </ul>
          )}
          </div>
        </div>
        <div className={styles.buttonContainer}>
          <Button type="button" kind="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    );
  };