/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import styles from "@/styles/TestRunsPage.module.css";
import { Button } from "@carbon/react";
import { Search } from "@carbon/react";
import { 
  StructuredListWrapper, 
  StructuredListHead,
  StructuredListCell, 
  StructuredListRow, 
  StructuredListBody, 
  TextInput
} from "@carbon/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface FilterableField {
    id: string;
    label: string;
    description: string;
    placeHolder: string;
}

const filterableFields: FilterableField[] = [
  {id: 'runName', label: 'Test Run Name', placeHolder: 'any', description: 'Type the name of one test run. An exact match is search for.'},
  {id: 'requestor', label: 'Requestor', placeHolder: 'any', description: 'Type the name of the requestor.'},
  {id: 'group', label: 'Group', placeHolder: 'any', description: 'Type the name of the group.'},
  {id: 'package', label: 'Package', placeHolder: 'any', description: 'Type the name of the package.'},
  {id: 'testName', label: 'Test Name', placeHolder: 'any', description: 'Type the name of the test.'},
  {id: 'status', label: 'Status', placeHolder: 'Cancelled, Requeued, Passed, Failed, Error', description: 'Type the status of the test run.'},
  {id: 'tags', label: 'Tags', placeHolder: 'any', description: 'Type the tags associated with the test run.'},
  {id: 'result', label: 'Result', placeHolder: 'Finished, Queued, RunDone, Waiting', description: 'Type the result of the test run.'},
];


export default function SearchCriteriaContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState(filterableFields[0]);
  const [currentInputValue, setCurrentInputValue] = useState('');

  // Initialize the saved query  state directly from the URL
  const [query, setQuery] = useState(() => {
    const initialQuery : Map<string, string> = new Map();
    filterableFields.forEach(field => {
      const value = searchParams.get(field.id);
      if (value) {
        initialQuery.set(field.id, value);
      } 
    });
    return initialQuery;
  });

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const newQuery = new Map(query);
    if (currentInputValue && currentInputValue.trim() !== '') {
      newQuery.set(selectedFilter.id, currentInputValue.trim());
    } else {
      // If the input is empty, remove the filter
      newQuery.delete(selectedFilter.id);
    }
    setQuery(newQuery);

    // Update the URL with the new query parameters
    const params = new URLSearchParams();
    newQuery.forEach((value, key) => {
      params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, {scroll: false});

    setCurrentInputValue(''); // Clear the input after saving
  }


  const searchComponent = (title: string, placeholder: string) => {
    return (
      <form className={styles.filterInputContainer} onSubmit={handleSave}>
        <div className={styles.customComponentWrapper}>
          <p>{title}</p>
          <Search
            id="search-test-run-name"
            placeholder={placeholder}
            size="md"
            type="text"
            value={currentInputValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setCurrentInputValue(e.target.value);
            }}
            onClear={() => setCurrentInputValue('')}
          />
        </div>
        <div className={styles.buttonContainer}>
          <Button type="button" kind="secondary" onClick={()=> setCurrentInputValue('')}>Cancel</Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    );
  };

  const renderComponent = (field: FilterableField) => {
    switch (field.id) {
    case 'runName':
      return searchComponent(field.description, field.placeHolder);
    default:
      return searchComponent(field.description, field.placeHolder);
    }
  };


  return (
    <div>
      <p>Edit search criteria to describe the test results you wish to view</p>
      <div className={styles.searchCriteriaContainer}>
        <div className={styles.structuredListContainer}>
          <StructuredListWrapper selection>
            <StructuredListHead>
              <StructuredListRow head>
                <div className={styles.rowWrapper}>
                  <StructuredListCell head>Column Name</StructuredListCell>
                  <StructuredListCell head>Allowed Values</StructuredListCell>
                </div>
              </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
              {filterableFields.map((field) => (
                <StructuredListRow key={field.id}>
                  <div
                    key={field.id} 
                    onClick={() => setSelectedFilter(field)} 
                    className={`${styles.rowWrapper} ${selectedFilter.id === field.id ? styles.selectedRow : ''}`}
                  >
                    <StructuredListCell>{field.label}</StructuredListCell>
                    <StructuredListCell>{field.placeHolder}</StructuredListCell>
                  </div>
                </StructuredListRow>
              ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </div>
        {renderComponent(selectedFilter)}
      </div>
    </div>
  );
};