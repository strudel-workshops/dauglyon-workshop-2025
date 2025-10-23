import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { SciDataGrid } from '../../../components/SciDataGrid';
import {
  formatTimestamp,
  getLastNDaysTimeSpan,
  getStatusColor,
  KBaseJobsAPIClient,
} from '../-components/kbase-jobs-api';
import { JobDetailsPanel } from '../-components/JobDetailsPanel';
import { JobFiltersPanel } from '../-components/JobFiltersPanel';
import { useKBaseJobBrowser } from '../-context/ContextProvider';
import {
  setError,
  setFoundCount,
  setJobs,
  setLoading,
  setSelectedJob,
  setToken,
  setTotalCount,
} from '../-context/actions';

export const Route = createFileRoute('/kbase-job-browser/_layout/')({
  component: KBaseJobBrowserPage,
});

// CUSTOMIZE: KBase ServiceWizard URL (used for dynamic service discovery)
const SERVICE_WIZARD_URL = '/services/service_wizard';

function KBaseJobBrowserPage() {
  const { state, dispatch } = useKBaseJobBrowser();
  const [tokenInput, setTokenInput] = useState('');
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  const [apiClient, setApiClient] = useState<KBaseJobsAPIClient | null>(null);
  const fetchingRef = useRef(false);

  // Initialize API client when token is set
  useEffect(() => {
    if (state.token) {
      const client = new KBaseJobsAPIClient(SERVICE_WIZARD_URL, state.token);
      setApiClient(client);
    } else {
      setApiClient(null);
    }
  }, [state.token]);

  // Create a stable filter key to prevent unnecessary re-fetches
  const filterKey = useMemo(() => JSON.stringify(state.filter), [state.filter]);

  // Fetch jobs when parameters change
  useEffect(() => {
    if (!apiClient || !state.token || fetchingRef.current) return;

    const fetchJobs = async () => {
      fetchingRef.current = true;
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const timeSpan = getLastNDaysTimeSpan(state.timeRangeDays);
        const result = await apiClient.queryJobs({
          time_span: timeSpan,
          offset: state.page * state.pageSize,
          limit: state.pageSize,
          timeout: 30000,
          filter: state.filter,
          sort: [{ key: 'created', direction: 'descending' }],
        });

        dispatch(setJobs(result.jobs));
        dispatch(setFoundCount(result.found_count));
        dispatch(setTotalCount(result.total_count));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch jobs';
        dispatch(setError(errorMessage));
        dispatch(setJobs([]));
      } finally {
        dispatch(setLoading(false));
        fetchingRef.current = false;
      }
    };

    fetchJobs();
  }, [
    apiClient,
    state.token,
    state.page,
    state.pageSize,
    filterKey,
    state.timeRangeDays,
  ]);

  const handleTokenSubmit = () => {
    if (tokenInput.trim()) {
      dispatch(setToken(tokenInput.trim()));
    }
  };

  const handleClearToken = () => {
    setTokenInput('');
    dispatch(setToken(null));
    dispatch(setJobs([]));
    dispatch(setSelectedJob(null));
  };

  const handleRowClick = (params: any) => {
    dispatch(setSelectedJob(params.row));
  };

  // Define table columns
  const columns: GridColDef[] = [
    {
      field: 'job_id',
      headerName: 'Job ID',
      width: 180,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      valueGetter: (value, row) => row.state.status,
      renderCell: (params) => (
        <Chip
          label={params.value.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: getStatusColor(params.value),
            color: 'white',
            fontWeight: 'bold',
          }}
        />
      ),
    },
    {
      field: 'app',
      headerName: 'App',
      width: 200,
      valueGetter: (value, row) => row.app?.title || 'Unknown',
    },
    {
      field: 'owner',
      headerName: 'Owner',
      width: 150,
      valueGetter: (value, row) => row.owner.username,
    },
    {
      field: 'created',
      headerName: 'Created',
      width: 180,
      valueGetter: (value, row) => formatTimestamp(row.state.create_at),
    },
    {
      field: 'client_group',
      headerName: 'Client Group',
      width: 150,
      valueGetter: (value, row) => row.state.client_group,
    },
  ];

  return (
    <Box>
      <PageHeader
        pageTitle="KBase Job Browser"
        description="Browse and monitor KBase Narrative jobs using the JobBrowserBFF API"
        sx={{ marginBottom: 1, padding: 2 }}
      />

      {/* Token Input Section */}
      <Box sx={{ padding: 2, paddingTop: 0 }}>
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
          <Stack spacing={2}>
            <Typography variant="h6">Authentication</Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                label="KBase Token"
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleTokenSubmit();
                  }
                }}
                disabled={!!state.token}
                fullWidth
                size="small"
                helperText="Enter your KBase authentication token to access jobs"
              />
              {!state.token ? (
                <Button
                  variant="contained"
                  onClick={handleTokenSubmit}
                  disabled={!tokenInput.trim()}
                >
                  Connect
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  onClick={handleClearToken}
                  color="error"
                >
                  Disconnect
                </Button>
              )}
            </Stack>
            {state.token && (
              <Alert severity="success">
                Connected to KBase API. Showing jobs from the last{' '}
                {state.timeRangeDays} days (~
                {Math.round(state.timeRangeDays / 365)} years).
              </Alert>
            )}
          </Stack>
        </Paper>

        {/* Error Display */}
        {state.error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {state.error}
          </Alert>
        )}

        {/* Main Content - Only show if token is set */}
        {state.token && (
          <Stack direction="row" spacing={2}>
            {/* Filters Panel */}
            {showFiltersPanel && (
              <Box sx={{ width: '350px', flexShrink: 0 }}>
                <JobFiltersPanel
                  onClose={() => setShowFiltersPanel(false)}
                  apiClient={apiClient}
                />
              </Box>
            )}

            {/* Job List */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {state.loading && <LinearProgress />}
              <Box
                sx={{
                  padding: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="body2" color="text.secondary">
                    Showing {state.jobs.length} of {state.foundCount} jobs (
                    {state.totalCount} total in time range)
                  </Typography>
                  {!showFiltersPanel && (
                    <Button
                      size="small"
                      onClick={() => setShowFiltersPanel(true)}
                    >
                      Show Filters
                    </Button>
                  )}
                </Stack>
                <Box sx={{ flex: 1 }}>
                  <SciDataGrid
                    rows={state.jobs}
                    columns={columns}
                    getRowId={(row) => row.job_id}
                    loading={state.loading}
                    pageSizeOptions={[10, 20, 50, 100]}
                    paginationModel={{
                      page: state.page,
                      pageSize: state.pageSize,
                    }}
                    onPaginationModelChange={(model) => {
                      dispatch(setLoading(false));
                      if (model.page !== state.page) {
                        dispatch({
                          type: 'SET_PAGE' as any,
                          payload: model.page,
                        });
                      }
                      if (model.pageSize !== state.pageSize) {
                        dispatch({
                          type: 'SET_PAGE_SIZE' as any,
                          payload: model.pageSize,
                        });
                      }
                    }}
                    rowCount={state.foundCount}
                    paginationMode="server"
                    onRowClick={handleRowClick}
                    rowHeight={52}
                    sx={{
                      height: '100%',
                      '& .MuiDataGrid-row': {
                        cursor: 'pointer',
                      },
                    }}
                  />
                </Box>
              </Box>
            </Paper>

            {/* Job Details Panel */}
            {state.selectedJob && (
              <Box sx={{ width: '400px', flexShrink: 0 }}>
                <JobDetailsPanel
                  job={state.selectedJob}
                  onClose={() => dispatch(setSelectedJob(null))}
                  apiClient={apiClient}
                />
              </Box>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
