// KBase Jobs API Client
// Based on JobBrowserBFF service

import { JSONRPCClient } from './jsonrpc20';

// Job Status Types
export type JobStatus = 'create' | 'queue' | 'run' | 'complete' | 'error' | 'terminate';

// Job State Interfaces
export interface JobStateBase {
  status: JobStatus;
  create_at: number;
  client_group: string;
}

export interface JobStateCreate extends JobStateBase {
  status: 'create';
}

export interface JobStateQueue extends JobStateBase {
  status: 'queue';
  queue_at: number;
}

export interface JobStateRun extends JobStateBase {
  status: 'run';
  queue_at: number;
  run_at: number;
}

export interface JobStateComplete extends JobStateBase {
  status: 'complete';
  queue_at: number;
  run_at: number;
  finish_at: number;
}

export interface JobStateError extends JobStateBase {
  status: 'error';
  queue_at: number;
  run_at: number;
  finish_at: number;
  error: {
    code: number;
    message: string;
    jsonrpc_error?: any;
  };
}

export interface JobStateTerminate extends JobStateBase {
  status: 'terminate';
  queue_at: number;
  run_at: number;
  finish_at: number;
  reason: {
    code: number;
    message?: string;
  };
}

export type JobState =
  | JobStateCreate
  | JobStateQueue
  | JobStateRun
  | JobStateComplete
  | JobStateError
  | JobStateTerminate;

// App Information
export interface AppInfo {
  id: string;
  module_name: string;
  function_name: string;
  title: string;
  type: 'narrative' | 'unknown';
  icon_url?: string;
}

// Job Context Types
export interface JobContextNarrative {
  type: 'narrative';
  workspace: {
    id: number;
    is_accessible: boolean;
    is_deleted: boolean;
    name: string;
  };
  narrative: {
    title: string | null;
    is_temporary: boolean;
  };
}

export interface JobContextWorkspace {
  type: 'workspace';
  workspace: {
    id: number;
    is_accessible: boolean;
    is_deleted: boolean;
    name: string;
  };
}

export interface JobContextExport {
  type: 'export';
}

export interface JobContextUnknown {
  type: 'unknown';
}

export type JobContext =
  | JobContextNarrative
  | JobContextWorkspace
  | JobContextExport
  | JobContextUnknown;

// Job Info
export interface JobInfo {
  job_id: string;
  type: string;
  owner: {
    username: string;
    realname: string;
  };
  state: JobState;
  app: AppInfo | null;
  context: JobContext;
  node_class: string;
}

// API Parameters
export interface TimeSpan {
  from: number;
  to: number;
}

export interface JobFilter {
  workspace_id?: number[];
  status?: JobStatus[];
  user?: string[];
  client_group?: string[];
  app_id?: string[];
  app_module?: string[];
  app_function?: string[];
  job_id?: string[];
  error_code?: number[];
  terminated_code?: number[];
}

export interface QueryJobsParams {
  time_span: TimeSpan;
  offset: number;
  limit: number;
  timeout: number;
  sort?: Array<{
    key: 'created';
    direction: 'ascending' | 'descending';
  }>;
  search?: {
    terms: string[];
  };
  filter?: JobFilter;
  admin?: boolean;
}

export interface QueryJobsResult {
  jobs: JobInfo[];
  found_count: number;
  total_count: number;
}

export interface GetJobsParams {
  job_ids: string[];
  timeout: number;
  admin?: boolean;
}

export interface GetJobsResult {
  jobs: JobInfo[];
}

export interface LogEntry {
  row: number;
  logged_at: number;
  message: string;
  level: 'normal' | 'error';
}

export interface GetJobLogParams {
  job_id: string;
  offset: number;
  limit: number;
  timeout: number;
  search?: string[];
  level?: string[];
  admin?: boolean;
}

export interface GetJobLogResult {
  job: JobInfo;
  log: LogEntry[];
}

export interface CancelJobParams {
  job_id: string;
  timeout: number;
  admin: boolean;
}

export interface CancelJobResult {
  canceled: boolean;
}

export interface GetClientGroupsResult {
  client_groups: string[];
}

export interface IsAdminResult {
  is_admin: boolean;
}

// KBase Jobs API Client
export class KBaseJobsAPIClient {
  private client: JSONRPCClient;

  constructor(url: string, token?: string) {
    this.client = new JSONRPCClient({
      url,
      token,
      timeout: 30000,
    });
  }

  setToken(token: string) {
    this.client.setToken(token);
  }

  clearToken() {
    this.client.clearToken();
  }

  async queryJobs(params: QueryJobsParams): Promise<QueryJobsResult> {
    return this.client.call<QueryJobsResult>('JobBrowserBFF.query_jobs', params);
  }

  async getJobs(params: GetJobsParams): Promise<GetJobsResult> {
    return this.client.call<GetJobsResult>('JobBrowserBFF.get_jobs', params);
  }

  async getJobLog(params: GetJobLogParams): Promise<GetJobLogResult> {
    return this.client.call<GetJobLogResult>('JobBrowserBFF.get_job_log', params);
  }

  async cancelJob(params: CancelJobParams): Promise<CancelJobResult> {
    return this.client.call<CancelJobResult>('JobBrowserBFF.cancel_job', params);
  }

  async getClientGroups(): Promise<GetClientGroupsResult> {
    return this.client.call<GetClientGroupsResult>('JobBrowserBFF.get_client_groups', {});
  }

  async isAdmin(): Promise<IsAdminResult> {
    return this.client.call<IsAdminResult>('JobBrowserBFF.is_admin', {});
  }
}

// Helper function to get time span for last N days
export function getLastNDaysTimeSpan(days: number): TimeSpan {
  const to = Date.now();
  const from = to - days * 24 * 60 * 60 * 1000;
  return { from, to };
}

// Helper function to format timestamp
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString();
}

// Helper function to get status color
export function getStatusColor(status: JobStatus): string {
  switch (status) {
    case 'create':
      return '#9e9e9e'; // gray
    case 'queue':
      return '#2196f3'; // blue
    case 'run':
      return '#ff9800'; // orange
    case 'complete':
      return '#4caf50'; // green
    case 'error':
      return '#f44336'; // red
    case 'terminate':
      return '#9c27b0'; // purple
    default:
      return '#757575';
  }
}
