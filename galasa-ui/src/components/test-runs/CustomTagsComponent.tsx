/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import { useState, FormEvent } from "react";
import { Button, TextInput } from "@carbon/react";
import styles from "@/styles/TestRunsPage.module.css";

interface CustomTagsComponentProps {
    title: string;
    tags: string[]; 
    onChange: (tags: string[]) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}

export default function CustomTagsComponent({ title, tags, onChange, onSubmit, onCancel }: CustomTagsComponentProps) {
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [selectedForRemoval, setSelectedForRemoval] = useState<string[]>([]);

  const handleAddTag = () => {
    const newTag = currentTagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setCurrentTagInput(''); 
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTags = () => {
    // Create the new list by filtering out selected tags
    const newTags = tags.filter(tag => !selectedForRemoval.includes(tag));
    // Call the parent's onChange with the new list
    onChange(newTags);
    setSelectedForRemoval([]);
  };

  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedForRemoval(selectedOptions);
  };

  return (
    <form className={styles.filterInputContainer} onSubmit={onSubmit}>
      <div className={styles.customComponentWrapper}>
        <p>{title}</p>
        <div className={styles.tagInputWrapper}>
          <TextInput
            id="tag-input"
            labelText=""
            hideLabel
            placeholder="any"
            value={currentTagInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentTagInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className={styles.buttonContainer}>
            <Button
              type="button"
              kind="secondary"
              className={styles.removeTagButton}
              onClick={handleRemoveTags}
              disabled={selectedForRemoval.length === 0}
            >
                    Remove
            </Button>
            <Button type="button" onClick={handleAddTag}>Add</Button>
          </div>

        </div>

        <select
          multiple
          className={styles.tagsListbox}
          onChange={handleSelectionChange}
          value={selectedForRemoval}
        >
          {tags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>
      <div className={styles.buttonContainer}>
        <Button type="button" kind="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}