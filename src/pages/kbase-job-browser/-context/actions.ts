import { JobInfo, JobStatus, JobFilter } from '../-components/kbase-jobs-api';

export enum KBaseJobBrowserActionType {
  SET_TOKEN = 'SET_TOKEN',
  SET_JOBS = 'SET_JOBS',
  SET_LOADING = 'SET_LOADING',
  SET_ERROR = 'SET_ERROR',
  SET_SELECTED_JOB = 'SET_SELECTED_JOB',
  SET_FILTER = 'SET_FILTER',
  SET_PAGE = 'SET_PAGE',
  SET_PAGE_SIZE = 'SET_PAGE_SIZE',
  SET_TIME_RANGE_DAYS = 'SET_TIME_RANGE_DAYS',
  SET_TOTAL_COUNT = 'SET_TOTAL_COUNT',
  SET_FOUND_COUNT = 'SET_FOUND_COUNT',
}

export interface KBaseJobBrowserAction {
  type: KBaseJobBrowserActionType;
  payload?: any;
}

export const setToken = (token: string): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_TOKEN,
  payload: token,
});

export const setJobs = (jobs: JobInfo[]): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_JOBS,
  payload: jobs,
});

export const setLoading = (loading: boolean): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_LOADING,
  payload: loading,
});

export const setError = (error: string | null): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_ERROR,
  payload: error,
});

export const setSelectedJob = (job: JobInfo | null): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_SELECTED_JOB,
  payload: job,
});

export const setFilter = (filter: Partial<JobFilter>): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_FILTER,
  payload: filter,
});

export const setPage = (page: number): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_PAGE,
  payload: page,
});

export const setPageSize = (pageSize: number): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_PAGE_SIZE,
  payload: pageSize,
});

export const setTimeRangeDays = (days: number): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_TIME_RANGE_DAYS,
  payload: days,
});

export const setTotalCount = (count: number): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_TOTAL_COUNT,
  payload: count,
});

export const setFoundCount = (count: number): KBaseJobBrowserAction => ({
  type: KBaseJobBrowserActionType.SET_FOUND_COUNT,
  payload: count,
});
