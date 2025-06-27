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
import { useTranslations } from "next-intl";

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


export default function SearchCriteriaContent({requestorNamesPromise, resultsNamesPromise}: SearchCriteriaContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const translations = useTranslations("SearchCriteriaContent");


  const filterableFields: FilterableField[] = [
    {id: 'runName', label: translations("fields.runName.label"), placeHolder: 'any', description: translations("fields.runName.description")},
    {id: 'requestor', label: translations("fields.requestor.label"), placeHolder: 'any', description: translations("fields.requestor.description")},
    {id: 'group', label: translations("fields.group.label"), placeHolder: 'any', description: translations("fields.group.description")},
    {id: 'bundle', label: translations("fields.bundle.label"), placeHolder: 'any', description: translations("fields.bundle.description")},
    {id: 'submissionId', label: translations("fields.submissionId.label"), placeHolder: 'any', description: translations("fields.submissionId.description")},
    {id: 'testName', label: translations("fields.testName.label"), placeHolder: 'any', description: translations("fields.testName.description")},
    {id: 'status', label: translations("fields.status.label"), placeHolder: 'Cancelled, Requeued, Passed, Failed, Error', description: translations("fields.status.description")},
    {id: 'tags', label: translations("fields.tags.label"), placeHolder: 'any', description: translations("fields.tags.description")},
    {id: 'result', label: translations("fields.result.label"), placeHolder: 'Finished, Queued, RunDone, Waiting', description: translations("fields.result.description")},
  ];

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

  const updateQueryAndUrl = (newQuery: Map<string, string>) => {
    // Update the component's query state
    setQuery(newQuery);
  
    // Synchronize the browser's URL with the new query
    const params = new URLSearchParams();
    newQuery.forEach((value, key) => {
      params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSave = (event: FormEvent) => {
    event.preventDefault();

    // Determine the new value for the currently selected filter
    let valueToSet = '';
    if (selectedFilter.id === 'result') {
      valueToSet = selectedResults.join(',');
    } else if (selectedFilter.id === 'status') {
      valueToSet = selectedStatuses.join(',');
    } else if (selectedFilter.id === 'tags') {
      valueToSet = selectedTags.join(',');
    } else {
      valueToSet = currentInputValue.trim();
    }

    // Get the old value from the query state for comparison
    const oldValue = query.get(selectedFilter.id) || '';

    // Only proceed if the value has actually changed.
    if (valueToSet !== oldValue) {
      const newQuery = new Map(query);

      // If the new value is not empty, set it. Otherwise, delete the key.
      if (valueToSet) {
        newQuery.set(selectedFilter.id, valueToSet);
      } else {
        // If the value is empty, remove the key from the query
        newQuery.delete(selectedFilter.id);
      }
  
      // Update the URL with the new query parameters and set the query state
      updateQueryAndUrl(newQuery);
    };
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

  const handleClearAndSave = (fieldId: string) => {
    if (selectedFilter.id === fieldId) {
      setCurrentInputValue('');
    }
  
    const newQuery = new Map(query);
    if (newQuery.has(fieldId)) {
      newQuery.delete(fieldId); 
      updateQueryAndUrl(newQuery);
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
      onClear: () => handleClearAndSave(field.id),
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

    const tagsProps = {
      title: field.description,
      tags: selectedTags,
      onChange: setSelectedTags,
      onSubmit: handleSave,
      onCancel: handleCancel,
    };

    let customComponent;
    switch (field.id) {
    case 'requestor':
      customComponent = <CustomSearchComponent {...searchProps} allRequestors={allRequestors} />;
      break;
    case 'result':
    case 'status':
      customComponent = <CustomCheckBoxList {...checkboxProps} />;
      break;
    case 'tags':
      customComponent = <CustomTagsComponent {...tagsProps} />;
      break;
    default:
      customComponent = <CustomSearchComponent {...searchProps} />;
      break;
    }
    return customComponent;
  };

  return (
    <div>
      <p>{translations('description')}</p>
      <div className={styles.searchCriteriaContainer}>
        <div className={styles.structuredListContainer}>
          <StructuredListWrapper selection>
            <StructuredListHead>
              <StructuredListRow head>
                <div className={styles.rowWrapper}>
                  <StructuredListCell head>{translations('table.columnName')}</StructuredListCell>
                  <StructuredListCell head>{translations('table.allowedValues')}</StructuredListCell>
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