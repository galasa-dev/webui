
# Run Details

The Run Details page is where you can view all of the information about a run. This currently only includes the attributes of the run and the methods run inside the test, and the runlog.

## Components

### run-log

The runlog has multiple different sub-components built into it:

This is the over-arching runlog view that appearch when you click the runlog tab.

*  `log` - This is the full log. The runlog from the API gets passed to this component from the top of the hierarchy (run-log) and trickled down into log.

*  `runlog-line` - This is a sub-component of log. This is the individual runlog lines that get broken up so we can store metadata about each of the lines and search the lines for content via the search bars on the run-log component page.

*  `log-regex` - This is where the regex is retrieved to be able to search the runlog via a regex.

*  `log-search` - This is where non-regex searches of the runlog are made via a search bar.

*  `log-scroller (TO BE RENAMED)` - This is the minified view of the runlog used by the user to scroll through larger sections of a log.

*  `line-metadata` - A sub-component of `log` which tells you what type of line it is e.g. an error.

### log

Example :

```html

<app-log  id = "scroll"  [runlog]="runlog"  [searchText]="searchText"></app-log>

```
Inputs:

* runlog - The log takes the full log as an input from the run-log component to split it into lines as an object to split into separate runlog-line components.

* searchText - The log takes the searchText to be able to search each line of the log for a match. Currently using a `RegExp` object using flags such as `g` and `gi` to turn capitalisation on and off when selected by the user.

### runlog-line

Inputs:

* `line` - An object containing data about the line:

```json
{
content:  "line content",
num:  0
} 
```
  
*  `searchText` - The search query to highlight search results.

*  `type` - Type of metadata in the line. This is then fed to the `line-metadata` component so it can load the correct image.

### log-regex

Contains the combo-box to input the regex, currently the button doesnt work to submit the regex but pressing `enter` does work. This page is almost identical to `log-search` but uses a combobox instead of a search bar as it is not dynamic. Jump feature will need to be added.

Inputs:

*  `testStructure` - When this input changes then the log may change.

*  `runlog` - To be handed to the `log` component and broken up into lines.

### log-search

This has a dynamic search feature using a search bar and will show all or one of the results (depending on the user preference set with a checkbox) when you start typing. You can also jump to different results using the arrows. You can turn on and off whitespace and capitalisation too. 

Inputs:

*  `testStructure` - When this input changes then the log may change.

*  `run-log` - To be handed to the `log` component and broken up into lines.

### log-scroller


Currently has not been developed but will need to take the runlog as an input to create a minified scrollable view to jump to different points in the larger runlog.


### line-metadata

Currently shows metadata for warnings, errors, and header blocks. Needs functionality from the overflow menu to disable/enable them and needs styling.

Inputs:

*  `type` - Gets this from the `runlog-line` component and it tells the component what image to use as the metadata.

### galasa-tabs

Built to replace the tabs carbon component as we needed to have different styling on these tabs compared to the styling we have already put on the carbon component tabs

### galasa-tab

A singular tab to replace carbon tab.

Inputs:

*  `active` - Tells `galasa-tabs` that this tab is active.

*  `title` - The writing to go on the tab.

Outputs:

*  `selected` - Tells `galasa-tabs` that this tab has been selected.

### methods

A carbon table with all of the methods that have been run in a test

Inputs:

*  `testMethods` - An array of test method objects to populate the carbon table. An example of a method array:
```json
"methods": [
{
"className":  "dev.galasa.example.test",
"methodName":  "testAllSetupOk",
"type":  "Test",
"runLogStart":  0,
"runLogEnd":  0,
"befores":  [],
"afters":  []
...
```
### run-overview

The over-arching overview component that appears when you click the overview tab.

This component shows all details of the currently selected run by using using multiple different components:

* `run-detail`
* `date-time`
* `test-result`
* `inverse-test-result`

Inputs:

* `testStructure` - The structure passed from the API to be able to fill out the run details
* `testMethods` - The test methods passed from the API to be able to fill out the `methods` table

### run-detail

A singular run detail

Inputs:

* `value` to input the value of the detail and what it should contain

### date-time

Converts UTC date and time ISO string to users' browser locale and changes the formatting.

Inputs:

* `value` - The string value for the date and time.

### test-result

Show the test result with the symbol first and then the label for the result.

Inputs:

* `value` - The test result value e.g. Passed.

### inverse-test-result

Same as `test-result` but the label is before the symbol.

* `value` - The test result value e.g. Passed.

## Issues/TODO

* The overflow menu carbon component does not allow you to use checkboxes properly inside of the overflow menu component. I was informed that one way to stop this is to stop propagation and immediate propagation.

* Overflow menu needs to enable and disable different metadata

* The runlog lines, numbers, and metadata need to be aligned properly. Perhaps using Carbon Grid.

* Need to make the minified view and make it scrollable.

* Create functionality from the scrollbar and jump combobox.

* Create History view.

* Create Artifacts view.

*  `log-regex` seems to be submitting values on every mouse movement.

* Potentially find new way of highlighting the search results as currently the way of doing it is slightly broken as the DOM does not update fast enough to retrieve the list of search results to be able to jump through them with the seeking arrows on `log-search`
