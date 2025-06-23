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
} from "@carbon/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import CustomSearchComponent from "./CustomSearchComponent";

interface FilterableField {
    id: string;
    label: string;
    description: string;
    placeHolder: string;
}

interface SearchCriteriaContentProps {
  requestorNamesPromise: Promise<string[]>, resultsNamesPromise: Promise<string[]>
}

const filterableFields: FilterableField[] = [
  {id: 'runName', label: 'Test Run Name', placeHolder: 'any', description: 'Type the name of one test run. An exact match is searched for.'},
  {id: 'requestor', label: 'Requestor', placeHolder: 'any', description: 'Type the name of a requestor. An exact match is searched for.'},
  {id: 'group', label: 'Group', placeHolder: 'any', description: 'Type the name of the group.'},
  {id: 'bundle', label: 'Bundle', placeHolder: 'any', description: 'Type the name of the bundle.'},
  {id: 'package', label: 'Package', placeHolder: 'any', description: 'Type the name of the package.'},
  {id: 'testName', label: 'Test Name', placeHolder: 'any', description: 'Type the name of the test.'},
  {id: 'status', label: 'Status', placeHolder: 'Cancelled, Requeued, Passed, Failed, Error', description: 'Type the status of the test run.'},
  {id: 'tags', label: 'Tags', placeHolder: 'any', description: 'Type the tags associated with the test run.'},
  {id: 'result', label: 'Result', placeHolder: 'Finished, Queued, RunDone, Waiting', description: 'Type the result of the test run.'},
];

export default function SearchCriteriaContent({requestorNamesPromise, resultsNamesPromise}: SearchCriteriaContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState(filterableFields[0]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [allRequestors, setAllRequestors] = useState<string[]>([]);
  const [resultsNames, setResultsNames] = useState<string[]>([]);


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

  // Fetch all requestors on mount 
  useEffect(() => {
    const loadRequestors = async () => {
      try {
        const requestors = await requestorNamesPromise;
        console.log("Requestors fetched:", requestors);
        setAllRequestors(requestors);
      } catch (error) {
        console.error("Error fetching requestors:", error);
      }
    }
    loadRequestors();
  }, [requestorNamesPromise]);

  // Get all results names
  useEffect(() => {
    const loadResultsNames = async () => {
      try {
        const resultsNames = await resultsNamesPromise;
        console.log("Results fetched:", resultsNames);
        setResultsNames(resultsNames);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    }
    loadResultsNames();
  }, [resultsNamesPromise])

  // Update the current input value when the selected filter changes or when the query is updated
  useEffect(() => {
    const savedValue = query.get(selectedFilter.id) || '';
    setCurrentInputValue(savedValue);
  }, [selectedFilter, query]);


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
  }

  const handleCancel = () => {
    // Revert any typing by resetting the input to the last saved value
    setCurrentInputValue(query.get(selectedFilter.id) || '');
  };


  // Render the editor component based on the selected filter
  const renderComponent = (field: FilterableField) => {
    const commonProps = {
      title: field.description,
      placeholder: field.placeHolder,
      value: currentInputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCurrentInputValue(e.target.value),
      onClear: () => setCurrentInputValue(''),
      onSubmit: handleSave,
      onCancel: handleCancel,
    };

    switch (field.id) {
    case 'runName':
      return <CustomSearchComponent {...commonProps} />;
    case 'requestor':
      return <CustomSearchComponent {...commonProps} allRequestors={allRequestors} />;
    default:
      return <CustomSearchComponent {...commonProps} />;
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
                    <StructuredListCell>{query.get(field.id) || field.placeHolder}</StructuredListCell>
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