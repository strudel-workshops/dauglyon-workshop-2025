import React, { useContext, useReducer } from 'react';
import { JobInfo, JobFilter } from '../-components/kbase-jobs-api';
import { KBaseJobBrowserAction, KBaseJobBrowserActionType } from './actions';

export interface KBaseJobBrowserState {
  token: string | null;
  jobs: JobInfo[];
  selectedJob: JobInfo | null;
  loading: boolean;
  error: string | null;
  filter: JobFilter;
  page: number;
  pageSize: number;
  timeRangeDays: number;
  totalCount: number;
  foundCount: number;
}

interface KBaseJobBrowserProviderProps {
  children: React.ReactNode;
}

const KBaseJobBrowserContext = React.createContext<
  { state: KBaseJobBrowserState; dispatch: React.Dispatch<KBaseJobBrowserAction> } | undefined
>(undefined);

const initialState: KBaseJobBrowserState = {
  token: null,
  jobs: [],
  selectedJob: null,
  loading: false,
  error: null,
  filter: {},
  page: 0,
  pageSize: 20,
  timeRangeDays: 7,
  totalCount: 0,
  foundCount: 0,
};

function kbaseJobBrowserReducer(
  state: KBaseJobBrowserState,
  action: KBaseJobBrowserAction,
): KBaseJobBrowserState {
  switch (action.type) {
    case KBaseJobBrowserActionType.SET_TOKEN:
      return { ...state, token: action.payload };
    case KBaseJobBrowserActionType.SET_JOBS:
      return { ...state, jobs: action.payload };
    case KBaseJobBrowserActionType.SET_LOADING:
      return { ...state, loading: action.payload };
    case KBaseJobBrowserActionType.SET_ERROR:
      return { ...state, error: action.payload };
    case KBaseJobBrowserActionType.SET_SELECTED_JOB:
      return { ...state, selectedJob: action.payload };
    case KBaseJobBrowserActionType.SET_FILTER:
      return { ...state, filter: { ...state.filter, ...action.payload }, page: 0 };
    case KBaseJobBrowserActionType.SET_PAGE:
      return { ...state, page: action.payload };
    case KBaseJobBrowserActionType.SET_PAGE_SIZE:
      return { ...state, pageSize: action.payload, page: 0 };
    case KBaseJobBrowserActionType.SET_TIME_RANGE_DAYS:
      return { ...state, timeRangeDays: action.payload, page: 0 };
    case KBaseJobBrowserActionType.SET_TOTAL_COUNT:
      return { ...state, totalCount: action.payload };
    case KBaseJobBrowserActionType.SET_FOUND_COUNT:
      return { ...state, foundCount: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

export const KBaseJobBrowserProvider: React.FC<KBaseJobBrowserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(kbaseJobBrowserReducer, initialState);

  return (
    <KBaseJobBrowserContext.Provider value={{ state, dispatch }}>
      {children}
    </KBaseJobBrowserContext.Provider>
  );
};

export const useKBaseJobBrowser = () => {
  const context = useContext(KBaseJobBrowserContext);
  if (context === undefined) {
    throw new Error('useKBaseJobBrowser must be used within KBaseJobBrowserProvider');
  }
  return context;
};
