# KBase Job Browser

A STRUDEL task flow page for browsing and monitoring KBase Narrative jobs using the JobBrowserBFF API.

## Features

- **Authentication**: Token-based authentication for accessing KBase jobs
- **Job Listing**: Paginated view of jobs with server-side pagination
- **Filtering**: Filter jobs by:
  - Time range (1-90 days)
  - Job status (create, queue, run, complete, error, terminate)
  - Job ID
  - Username
  - App module
  - Client group
- **Job Details**: View detailed information about individual jobs including:
  - Job metadata (ID, owner, timestamps, status)
  - App information (if available)
  - Context information (narrative/workspace details)
  - Error details (for failed jobs)
  - Termination reason (for terminated jobs)
- **Job Management**: Cancel running or queued jobs

## Usage

1. Navigate to `/kbase-job-browser` in your browser
2. Enter your KBase authentication token in the text field
3. Click "Connect" to authenticate
4. Browse jobs using the data grid
5. Use the filters panel on the left to refine your search
6. Click on any job row to view detailed information in the right panel

## API Configuration

The page connects to the KBase JobBrowserBFF service at:
```
https://ci.kbase.us/services/job_browser_bff
```

To use a different environment, modify the `KBASE_API_URL` constant in `_layout/index.tsx`.

## Authentication

To get a KBase token:
1. Log in to KBase at https://narrative.kbase.us/
2. Go to your account settings
3. Generate a new developer token
4. Copy the token and paste it into the KBase Job Browser

## File Structure

```
kbase-job-browser/
├── _layout.tsx                          # Layout wrapper with context provider
├── _layout/
│   └── index.tsx                        # Main page component
├── -components/
│   ├── jsonrpc20.ts                     # JSONRPC 2.0 client implementation
│   ├── kbase-jobs-api.ts                # KBase Jobs API client and types
│   ├── JobDetailsPanel.tsx              # Job details side panel
│   └── JobFiltersPanel.tsx              # Filters side panel
└── -context/
    ├── actions.ts                       # Redux-style actions
    └── ContextProvider.tsx              # State management context
```

## API Methods Used

- `JobBrowserBFF.query_jobs` - Query jobs with filters and pagination
- `JobBrowserBFF.cancel_job` - Cancel a running or queued job

## State Management

The page uses React Context with useReducer for state management:
- Token storage
- Job list
- Selected job
- Filters
- Pagination state
- Time range selection

## Customization

### Change API Endpoint
Edit `KBASE_API_URL` in `_layout/index.tsx`:
```typescript
const KBASE_API_URL = 'https://your-kbase-instance.com/services/job_browser_bff';
```

### Modify Filters
Update the filter panel in `-components/JobFiltersPanel.tsx` to add/remove filter options.

### Customize Table Columns
Modify the `columns` array in `_layout/index.tsx` to change which fields are displayed in the job list.

## Technical Details

### JSONRPC 2.0
All API calls use JSONRPC 2.0 protocol with the following structure:
```json
{
  "jsonrpc": "2.0",
  "method": "JobBrowserBFF.query_jobs",
  "id": "unique-uuid",
  "params": { ... }
}
```

### Job Status Values
- `create` - Job has been created
- `queue` - Job is queued for execution
- `run` - Job is currently running
- `complete` - Job completed successfully
- `error` - Job failed with an error
- `terminate` - Job was terminated

### Dependencies
- `uuid` - For generating unique request IDs
- Material-UI components
- TanStack Router for routing
- React Context for state management
