import { Close as CloseIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { LabelValueTable } from '../../../components/LabelValueTable';
import {
  formatTimestamp,
  getStatusColor,
  JobInfo,
  KBaseJobsAPIClient,
} from './kbase-jobs-api';

interface JobDetailsPanelProps {
  job: JobInfo;
  onClose: () => void;
  apiClient: KBaseJobsAPIClient | null;
}

export const JobDetailsPanel: React.FC<JobDetailsPanelProps> = ({
  job,
  onClose,
  apiClient,
}) => {
  const [activeTab, setActiveTab] = useState(0);

  // Format job details for display
  const jobDetails = [
    { label: 'Job ID', value: job.job_id },
    { label: 'Status', value: job.state.status.toUpperCase() },
    { label: 'Owner', value: `${job.owner.realname} (${job.owner.username})` },
    { label: 'Type', value: job.type },
    { label: 'Node Class', value: job.node_class },
    { label: 'Client Group', value: job.state.client_group },
    { label: 'Created At', value: formatTimestamp(job.state.create_at) },
  ];

  // Add state-specific timestamps
  if ('queue_at' in job.state) {
    jobDetails.push({
      label: 'Queued At',
      value: formatTimestamp(job.state.queue_at),
    });
  }
  if ('run_at' in job.state) {
    jobDetails.push({
      label: 'Run At',
      value: formatTimestamp(job.state.run_at),
    });
  }
  if ('finish_at' in job.state) {
    jobDetails.push({
      label: 'Finished At',
      value: formatTimestamp(job.state.finish_at),
    });
  }

  // App details
  const appDetails = job.app
    ? [
        { label: 'App ID', value: job.app.id },
        { label: 'Title', value: job.app.title },
        { label: 'Module', value: job.app.module_name },
        { label: 'Function', value: job.app.function_name },
        { label: 'Type', value: job.app.type },
      ]
    : [];

  // Context details
  const contextDetails: Array<{ label: string; value: string }> = [
    { label: 'Type', value: job.context.type },
  ];

  if (job.context.type === 'narrative' || job.context.type === 'workspace') {
    contextDetails.push({
      label: 'Workspace ID',
      value: String(job.context.workspace.id),
    });
    contextDetails.push({
      label: 'Workspace Name',
      value: job.context.workspace.name,
    });
    contextDetails.push({
      label: 'Accessible',
      value: job.context.workspace.is_accessible ? 'Yes' : 'No',
    });
    contextDetails.push({
      label: 'Deleted',
      value: job.context.workspace.is_deleted ? 'Yes' : 'No',
    });

    if (job.context.type === 'narrative') {
      contextDetails.push({
        label: 'Narrative Title',
        value: job.context.narrative.title || 'Untitled',
      });
      contextDetails.push({
        label: 'Temporary',
        value: job.context.narrative.is_temporary ? 'Yes' : 'No',
      });
    }
  }

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ padding: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Job Details</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Chip
          label={job.state.status.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: getStatusColor(job.state.status),
            color: 'white',
            fontWeight: 'bold',
            marginTop: 1,
          }}
        />
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
      >
        <Tab label="Details" />
        <Tab label="App" disabled={!job.app} />
        <Tab label="Context" />
        {job.state.status === 'error' && <Tab label="Error" />}
      </Tabs>

      {/* Tab Content */}
      <Box sx={{ padding: 2, overflow: 'auto', flex: 1 }}>
        {activeTab === 0 && <LabelValueTable rows={jobDetails} />}

        {activeTab === 1 && job.app && <LabelValueTable rows={appDetails} />}

        {activeTab === 2 && <LabelValueTable rows={contextDetails} />}

        {activeTab === 3 && job.state.status === 'error' && (
          <Box>
            {job.state.status === 'error' && (
              <Alert severity="error">
                <Typography variant="subtitle2">
                  Error Code: {job.state.error.code}
                </Typography>
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  {job.state.error.message}
                </Typography>
              </Alert>
            )}
          </Box>
        )}

        {job.state.status === 'terminate' && (
          <Box sx={{ marginTop: 2 }}>
            <Alert severity="warning">
              <Typography variant="subtitle2">
                Termination Code: {job.state.reason.code}
              </Typography>
              {job.state.reason.message && (
                <Typography variant="body2" sx={{ marginTop: 1 }}>
                  {job.state.reason.message}
                </Typography>
              )}
            </Alert>
          </Box>
        )}

        {/* Cancel Button for Running Jobs */}
        {(job.state.status === 'run' || job.state.status === 'queue') &&
          apiClient && (
            <Box sx={{ marginTop: 2 }}>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={async () => {
                  try {
                    await apiClient.cancelJob({
                      job_id: job.job_id,
                      timeout: 30000,
                      admin: false,
                    });
                    alert('Job cancellation requested');
                  } catch (error) {
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : 'Failed to cancel job';
                    alert(`Error: ${errorMessage}`);
                  }
                }}
              >
                Cancel Job
              </Button>
            </Box>
          )}
      </Box>
    </Paper>
  );
};
