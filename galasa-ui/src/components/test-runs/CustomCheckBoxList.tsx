/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import styles from "@/styles/TestRunsPage.module.css";
import { 
  Checkbox,
  CheckboxGroup 
} from "@carbon/react";
import { Button } from "@carbon/react";
import { FormEvent } from "react";

interface CheckBoxListProps {
    title: string;
    items: string[];
    selectedItems: string[];
    onChange: (newSelectedItems: string[]) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
  }
  

export default function CheckBoxList({ title, items, selectedItems, onChange, onSubmit, onCancel }: CheckBoxListProps) {
    const handleItemChange = (checked: boolean, name: string) => {
      if (checked) {
        onChange([...selectedItems, name]);
      } else {
        onChange(selectedItems.filter(item=> item !==name));
      }
    };
  
    const handleAllChange = (checked: boolean) => {
      onChange(checked ? items : []);
    };
  
    const areAllSelected = items.length > 0 && selectedItems.length === items.length;
    
    return (
      <form className={styles.filterInputContainer} onSubmit={onSubmit}>
        <p>{title}</p>
        <CheckboxGroup
          className={styles.checkBoxList}
        >
          <Checkbox defaultChecked={areAllSelected}
            id="checkbox-all"
            labelText="All"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleAllChange(event.target.checked)} />
          {items.map((name: string) => (
            <Checkbox
              key={name}
              id={`checkbox-${name}`}
              labelText={name.charAt(0).toUpperCase() + name.slice(1)}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => handleItemChange(event.target.checked, name)}
              checked={selectedItems.includes(name)}
            />
          ))}
        </CheckboxGroup>
        <div className={styles.buttonContainer}>
            <Button type="button" kind="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    );
  };