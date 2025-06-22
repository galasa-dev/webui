/*
 * Copyright contributors to the Galasa project
 *
 * SPDX-License-Identifier: EPL-2.0
 */
"use client";
import styles from "@/styles/TestRunsPage.module.css";
import { 
  StructuredListWrapper, 
  StructuredListHead,
  StructuredListCell, 
  StructuredListRow, 
  StructuredListBody, 
  TextInput
} from "@carbon/react";
import { useState } from "react";

interface FilterableField {
    id: string;
    label: string;
    value: string;
}

export default function SearchCriteriaContent() {
  const [selectedFilter, setSelectedFilter] = useState('runName');

  const filterableFields: FilterableField[] = [
    {id: 'runName', label: 'Test Run Name', value: 'any'},
    {id: 'requestor', label: 'Requestor', value: 'any'},
    {id: 'group', label: 'Group', value: 'any'},
    {id: 'package', label: 'Package', value: 'any'},
    {id: 'testName', label: 'Test Name', value: 'any'},
    {id: 'status', label: 'Status', value: 'Cancelled, Requeued, Passed, Failed, Error'},
    {id: 'tags', label: 'Tags', value: 'any'},
    {id: 'result', label: 'Result', value: 'Finished, Queued, RunDone, Waiting'},
    {id: 'environment', label: 'Environment', value: 'any'},
    {id: 'version', label: 'Version', value: 'any'},
    {id: 'submittedAt', label: 'Submitted At', value: 'any'},
    {id: 'queuedAt', label: 'Queued At', value: 'any'},
    {id: 'startedAt', label: 'Started At', value: 'any'},
  ];

  const selectedFieldData = filterableFields.find(field => field.id === selectedFilter);

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
                  <StructuredListCell head>Values</StructuredListCell>
                </div>
              </StructuredListRow>
            </StructuredListHead>
            <StructuredListBody>
              {filterableFields.map((field) => (
                <StructuredListRow key={field.id}>
                  <div
                    key={field.id} 
                    onClick={() => setSelectedFilter(field.id)} 
                    className={`${styles.rowWrapper} ${selectedFilter === field.id ? styles.selectedRow : ''}`}
                  >
                    <StructuredListCell>{field.label}</StructuredListCell>
                    <StructuredListCell>{field.value}</StructuredListCell>
                  </div>
                </StructuredListRow>
              ))}
            </StructuredListBody>
          </StructuredListWrapper>
        </div>
        <div className={styles.filterInputContainer}>
          {selectedFieldData && (
            <TextInput 
              id={`filter-${selectedFieldData.id}`}
              labelText={`Filter by ${selectedFieldData.label}`}
              placeholder={`Enter values for ${selectedFieldData.label}`}
              className={styles.filterInput}
              key={selectedFieldData.id}
            />
          )}
        </div>
      </div>    
    </div>
  );
};