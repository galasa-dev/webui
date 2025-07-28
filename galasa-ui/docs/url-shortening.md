# URL Shortening for Test Runs Page
To support shareability and bookmarkability of the Test Runs page, we preserve all UI state (filters, visible columns, column order, timeframes, sort orders, etc.) in the URL. However, this often leads to long, unreadable query strings. To address this, we introduce a URL shortening strategy that:
- Converts the verbose state into a compact representation.
- Uses value mapping and compression to minimize size.
- Encodes the final result in a URL-safe format `(q=<shortened-string>)`.

## Key Components

### 1. `TestRunsTabs`
- Stores filter state in the URL, such as:
```
test-runs?
tab=timeframe&
visibleColumns=submittedAt,runName,..
columnsOrder=submittedAt,runName,...&
from=2025-06-01T10%3A45%3A00.000Z&
to=2025-07-16T10%3A45%3A00.000Z
```
### 2. `urlEncoder` 
It mainly has 2 functions to compress/decompress the full URL state object.

`encodeStateToUrlParam(queryString: string): string`
- Parses the query string.
- Converts it to a minified object using `minifyState`.
- Converts to JSON and compresses using `lz-string`.
- Returns a safe URL-encoded string.
 `decodeStateFromUrlParam(encodedParam: string): string | null`
- Decompresses the `q` parameter using `lz-string`.
- Parses the JSON.
- Expands keys and values using `expandState`.
- Returns a reconstructed query string.
### 3. `urlStateMappers` 
Contains the logic for replacing verbose keys/values with compact alternatives:/

| Type      | Example                    | Minified                   | 
| --------- | -------------------------- | -------------------------- | 
| Key       | `runName`                  | `rn`                       |     
| Value     | `Passed`                   | `Pa`                       |   
| Timestamp | `2025-06-01T10:45:00.000Z` | `ltfsj5s` (base-36 millis) | 

Also handles list minification and sort orders:
- `visibleColumns=submittedAt,runName` → `vc=sA,rn`
- `sortOrder=submittedAt:desc` → `so=sA:d`
### Encoding Flow

**Example Input:**

```text
tab=timeframe&
visibleColumns=submittedAt,runName&
from=2025-06-01T10:45:00.000Z
to=2025-07-16T10%3A45%3A00.000Z
```

**Step 1: Convert to object**

```ts
{
  tab: "timeframe",
  visibleColumns: "submittedAt,runName",
  from: "2025-06-01T10:45:00.000Z"
  to: "2025-07-16T10%3A45%3A00.000Z"
}
```

**Step 2: Minify using `urlStateMappers`**

```ts
{
  t: "tf",
  vc: "sA,rn",
  f: "ltfsj5s" // base-36 timestamp
  to: "kr0s5w6o" // base-36 timestamp
}
```

**Step 3: JSON Stringify**

```json
{"t":"tf","vc":"sA,rn","f":"ltfsj5s", "to":"kr0s5w6o"}
```

**Step 4: Compress with `lz-string`**

```text
q=N4IgzgTghgTiBcIA8BhCBzEAuEA...
```

### Decoding Flow (Reverse)
1. Extract `q` parameter from URL.
2. Decompress with `lz-string`.
3. Parse the JSON to get the minified state.
4. Expand keys and values via `urlStateMappers`.
5. Convert back to URL query string.
Final decoded query:
```text
tab=timeframe&
visibleColumns=submittedAt,runName&
from=2025-06-01T10:45:00.000Z
```

### Important Notes
- The **key and value mappings** used for minification in `urlStateMappers.ts` are **hardcoded**.
- These mappings are used both for **encoding** and **decoding**, and they must stay **in sync**.
- If a new filter or query parameter is added to the system (e.g., a new column, status, or query key), make sure to:
  1. Add a new entry in `keyMap` and `valueMap`.
  2. Update the `minifyValue` and `expandValue` logic if the new param needs special handling (e.g., date, list, sort order).
