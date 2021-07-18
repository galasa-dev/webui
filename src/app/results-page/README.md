# Test History

This is where you can view, filter, and sort all of your test results.

## Components

### results-page

This is the top-level component which contains the side-nav bar, the table, and all of the filters.

### rasfilters

These filters utilise the Galasa API service in order to populate their lists. They are made with comboboxes from the carbon framework.

When a value in the filter changes, it updates the URL in order to extract values to update the table data from the API.

The different filters include:

* Bundles
* Date and time
* Requestors
* Result names
* Test Classes

### results-table

The table is built using the carbon table without the pagination model. The pagination model is attatched to the table separately as the API returns the table pages itself. For example:

```json
{
  "pageNum": 1,
  "pageSize": 100,
  "numPages": 6,
  "amountOfRuns": 507,
  "runs": [
    {
      "runId": "Run-1",
      "testStructure": {
        "runName": "J1",
        "bundle": "dev.example.tests",
        "testName": "dev.example.tests.aTestName",
        "testShortName": "aTestName",
        "requestor": "tester",
        "status": "ending",
        "result": "Passed",
        "queued": "2021-06-30T18:27:04.135Z",
        "startTime": "2021-06-30T18:29:22.051Z"
      }
    },
    {
      "runId": "Run-2",
      "testStructure": {
        "runName": "J2",
        "bundle": "dev.example.tests",
        "testName": "dev.example.tests.aTestName",
        "testShortName": "aTestName",
        "requestor": "tester",
        "status": "ending",
        "result": "Failed",
        "queued": "2021-06-30T18:27:04.185Z",
        "startTime": "2021-06-30T18:29:34.004Z"
      }
    }
    ...
```
This is then taken in by the table component via calling the API service and then the table is populated by looping through each object returned from the request. The table uses a model to be able to populate itself with objects and to populate the headers so there is a `newData` array that is populated with the current table data:

```javascript
newData.push([
                  new TableItem({data: {name: testResult, link: "../run/" + run.runId}, template: this.customResultTemplate}),
                  new TableItem({data: {name: run.testStructure.runName, id: run.runId, link: "../run/" + run.runId}, template: this.customItemTemplate}), 
                  new TableItem({data: {name: run.testStructure.testName, link: "../run/" + run.runId}, template: this.customItemTemplate}), 
                  new TableItem({data: {name: run.testStructure.startTime, link: "../run/" + run.runId}, template: this.customDateTemplate}),
                  new TableItem({data: {name: run.testStructure.endTime, link: "../run/" + run.runId}, template: this.customDateTemplate}),
                  new TableItem({data: {checked: isWorklist}, template: this.customWorklistTemplate})
                ]);
                newRuns.push(run);
              }
```

The table is also sortable upon request. This is also done via the API and all sorting is done on the backend due to having data sent to the table one page at a time from the servlets. When a sort is request, the data in the table is refreshed with data from a new API request with the sorting query.

## Issues/TODO

* Add in search bar to search for individual runs by runname



