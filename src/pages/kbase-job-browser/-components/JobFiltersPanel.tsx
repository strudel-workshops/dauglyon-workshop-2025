import { Close as CloseIcon } from '@mui/icons-material';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useKBaseJobBrowser } from '../-context/ContextProvider';
import { setFilter, setTimeRangeDays } from '../-context/actions';
import { JobStatus, KBaseJobsAPIClient } from './kbase-jobs-api';

interface JobFiltersPanelProps {
  onClose: () => void;
  apiClient: KBaseJobsAPIClient | null;
}

export const JobFiltersPanel: React.FC<JobFiltersPanelProps> = ({
  onClose,
}) => {
  const { state, dispatch } = useKBaseJobBrowser();

  const statusOptions: JobStatus[] = [
    'create',
    'queue',
    'run',
    'complete',
    'error',
    'terminate',
  ];

  const handleStatusChange = (status: JobStatus, checked: boolean) => {
    const currentStatuses = state.filter.status || [];
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter((s) => s !== status);

    dispatch(
      setFilter({ status: newStatuses.length > 0 ? newStatuses : undefined })
    );
  };

  const handleTimeRangeChange = (days: number) => {
    dispatch(setTimeRangeDays(days));
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ padding: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Filters</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Filter Content */}
      <Box sx={{ padding: 2, overflow: 'auto', flex: 1 }}>
        <Stack spacing={3}>
          {/* Time Range Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Time Range
            </Typography>
            <Select
              value={state.timeRangeDays}
              onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
              size="small"
              fullWidth
            >
              <MenuItem value={1}>Last 24 hours</MenuItem>
              <MenuItem value={3}>Last 3 days</MenuItem>
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
            </Select>
          </Box>

          {/* Status Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Job Status
            </Typography>
            <FormGroup>
              {statusOptions.map((status) => (
                <FormControlLabel
                  key={status}
                  control={
                    <Checkbox
                      checked={state.filter.status?.includes(status) || false}
                      onChange={(e) =>
                        handleStatusChange(status, e.target.checked)
                      }
                      size="small"
                    />
                  }
                  label={status.toUpperCase()}
                />
              ))}
            </FormGroup>
          </Box>

          {/* Job ID Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Job ID
            </Typography>
            <TextField
              placeholder="Enter job ID"
              size="small"
              fullWidth
              onChange={(e) => {
                const value = e.target.value.trim();
                dispatch(setFilter({ job_id: value ? [value] : undefined }));
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Filter by specific job ID
            </Typography>
          </Box>

          {/* Username Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Username
            </Typography>
            <TextField
              placeholder="Enter username"
              size="small"
              fullWidth
              onChange={(e) => {
                const value = e.target.value.trim();
                dispatch(setFilter({ user: value ? [value] : undefined }));
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Filter by job owner
            </Typography>
          </Box>

          {/* App Module Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              App Module
            </Typography>
            <TextField
              placeholder="Enter app module name"
              size="small"
              fullWidth
              onChange={(e) => {
                const value = e.target.value.trim();
                dispatch(
                  setFilter({ app_module: value ? [value] : undefined })
                );
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Filter by app module
            </Typography>
          </Box>

          {/* Client Group Filter */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Client Group
            </Typography>
            <TextField
              placeholder="Enter client group"
              size="small"
              fullWidth
              onChange={(e) => {
                const value = e.target.value.trim();
                dispatch(
                  setFilter({ client_group: value ? [value] : undefined })
                );
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Filter by client group
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Filter Summary */}
      <Box sx={{ padding: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          Active Filters:{' '}
          {Object.keys(state.filter).filter(
            (key) => state.filter[key as keyof typeof state.filter]
          ).length || 'None'}
        </Typography>
      </Box>
    </Paper>
  );
};
