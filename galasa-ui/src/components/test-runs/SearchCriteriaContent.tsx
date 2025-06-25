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
import { FormEvent, useEffect, useState } from "react";
import CustomSearchComponent from "./CustomSearchComponent";
import CustomCheckBoxList from "./CustomCheckBoxList";
import {TEST_RUNS_STATUS} from "@/utils/constants/common";
import CustomTagsComponent from "./CustomTagsComponent";

interface FilterableField {
    id: string;
    label: string;
    description: string;
    placeHolder: string;
}

interface SearchCriteriaContentProps {
  requestorNamesPromise: Promise<string[]>;
  resultsNamesPromise: Promise<string[]>;
}


const filterableFields: FilterableField[] = [
  {id: 'runName', label: 'Test Run Name', placeHolder: 'any', description: 'Type the name of one test run. An exact match is searched for.'},
  {id: 'requestor', label: 'Requestor', placeHolder: 'any', description: 'Type the name of a requestor. An exact match is searched for.'},
  {id: 'group', label: 'Group', placeHolder: 'any', description: 'Type the name of the group.'},
  {id: 'bundle', label: 'Bundle', placeHolder: 'any', description: 'Type the name of the bundle.'},
  {id: 'submissionId', label: 'Submission ID', placeHolder: 'any', description: 'Type the ID of the submission.'},
  {id: 'testName', label: 'Test Name', placeHolder: 'any', description: 'Type the name of the test.'},
  {id: 'status', label: 'Status', placeHolder: 'Cancelled, Requeued, Passed, Failed, Error', description: 'Select the status of the test result you wish to search for.'},
  {id: 'tags', label: 'Tags', placeHolder: 'any', description: 'Type the tags associated with the test run.'},
  {id: 'result', label: 'Result', placeHolder: 'Finished, Queued, RunDone, Waiting', description: 'Select the test result you wish to search for.'},
];

export default function SearchCriteriaContent({requestorNamesPromise, resultsNamesPromise}: SearchCriteriaContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState(filterableFields[0]);
  const [currentInputValue, setCurrentInputValue] = useState('');
  const [allRequestors, setAllRequestors] = useState<string[]>([]);
  const [resultsNames, setResultsNames] = useState<string[]>([]);
  const [selectedResults, setSelectedResults] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);


  // Initialize the saved query  state directly from the URL
  const [query, setQuery] = useState(() => {
    const initialQuery : Map<string, string> = new Map();
    filterableFields.forEach(field => {
      const value = searchParams.get(field.id);
      if (value) {
        // Set the value in the initial query map
        initialQuery.set(field.id, value);

        // If the field is 'result' or 'status' or 'tags', split the value into an array and set the corresponding state
        if (field.id === 'result') {
          setSelectedResults(value.split(','));
        } else if (field.id === 'status') {
          setSelectedStatuses(value.split(','));
        } else if (field.id === 'tags') {
          setSelectedTags(value.split(','));
        }
      } 
    });

    return initialQuery;
  });

  // Fetch all requestors on mount 
  useEffect(() => {
    const loadRequestors = async () => {
      try {
        const requestors = await requestorNamesPromise;
        setAllRequestors(requestors);
      } catch (error) {
        console.error("Error fetching requestors:", error);
      }
    };
    loadRequestors();
  }, [requestorNamesPromise]);

  // Get all results names
  useEffect(() => {
    const loadResultsNames = async () => {
      try {
        const resultsNames = await resultsNamesPromise;
        setResultsNames(resultsNames);
      } catch (error) {
        console.error("Error fetching results:", error);
      }
    };
    loadResultsNames();
  }, [resultsNamesPromise]);

  // Update the current input value when the selected filter changes or when the query is updated
  useEffect(() => {
    const savedValue = query.get(selectedFilter.id) || '';
    setCurrentInputValue(savedValue);

    // If the selected filter is 'result' or 'status' or 'tags', update the corresponding state
    if (selectedFilter.id === 'result') {
      const resultsFromQuery = query.get('result');
      setSelectedResults(resultsFromQuery ? resultsFromQuery.split(','): []);
    } else if (selectedFilter.id === 'status') {
      const statusesFromQuery = query.get('status');
      setSelectedStatuses(statusesFromQuery ? statusesFromQuery.split(',') : []);
    } else if (selectedFilter.id === 'tags') {
      const tagsFromQuery = query.get('tags');
      setSelectedTags(tagsFromQuery ? tagsFromQuery.split(',') : []);
    } 

  }, [selectedFilter, query]);

  

  const handleSave = (event: FormEvent) => {
    event.preventDefault();
    const newQuery = new Map(query);

    // Update the query based on the selected filter
    if (selectedFilter.id === 'result') {
      newQuery.set('result', selectedResults.length > 0 ? selectedResults.join(',') : '');
    } else if (selectedFilter.id === 'status') {
      newQuery.set('status', selectedStatuses.length > 0 ? selectedStatuses.join(',') : '');
    } else if (selectedFilter.id === 'tags') {
      newQuery.set('tags', selectedTags.length > 0 ? selectedTags.join(',') : '');
    }else {
      newQuery.set(selectedFilter.id, currentInputValue.trim());
    }

    // Clean up empty values from the query
    newQuery.forEach((value, key) => {
      if (!value) {
        newQuery.delete(key);
      }
    });
        
    setQuery(newQuery);

    // Update the URL with the new query parameters
    const params = new URLSearchParams();
    newQuery.forEach((value, key) => {
      params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, {scroll: false});
  };


  const handleCancel = () => {
    // Revert changes for the currently selected filter
    if (selectedFilter.id === 'result') {
      const resultsFromQuery = query.get('result');
      setSelectedResults(resultsFromQuery ? resultsFromQuery.split(',') : []);
    } else if (selectedFilter.id === 'status') {
      const statusesFromQuery = query.get('status');
      setSelectedStatuses(statusesFromQuery ? statusesFromQuery.split(',') : []);
    } else if (selectedFilter.id === 'tags') {
      const tagsFromQuery = query.get('tags');
      setSelectedTags(tagsFromQuery ? tagsFromQuery.split(',') : []);
    } else {
      setCurrentInputValue(query.get(selectedFilter.id) || '');
    }
  };


  // Render the editor component based on the selected filter
  const renderComponent = (field: FilterableField) => {
    // Props for the search component
    const searchProps = {
      title: field.description,
      placeholder: field.placeHolder,
      value: currentInputValue,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCurrentInputValue(e.target.value),
      onClear: () => setCurrentInputValue(''),
      onSubmit: handleSave,
      onCancel: handleCancel,
    };

    // Props for the checkbox list component
    const checkboxProps = {
      title: field.description,
      items: (field.id === 'result') ? resultsNames : TEST_RUNS_STATUS,
      selectedItems: (field.id === 'result') ? selectedResults : selectedStatuses,
      onChange: (field.id === 'result') ? setSelectedResults : setSelectedStatuses, 
      onSubmit: handleSave,
      onCancel: handleCancel,
    };

    const tagsPops = {
      title: field.description,
      tags: selectedTags,
      onChange: setSelectedTags,
      onSubmit: handleSave,
      onCancel: handleCancel,
    };

    switch (field.id) {
    case 'requestor':
      return <CustomSearchComponent {...searchProps} allRequestors={allRequestors} />;
    case 'result':
    case 'status':
      return <CustomCheckBoxList {...checkboxProps} />;
    case 'tags':
      return <CustomTagsComponent {...tagsPops} />;
    default:
      return <CustomSearchComponent {...searchProps} />;
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