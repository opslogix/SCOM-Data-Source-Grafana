import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface MyQuery extends DataQuery {
  type: 'performance' | 'alerts' | 'state',
  classes?: MonitoringClass[],
  instances?: MonitoringObject[],
  counters?: PerformanceCounter[],
  groups?: MonitoringGroup[],
  criteria?: string
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  type: 'alerts',
  criteria: 'Severity = 2 AND ResolutionState = 0'
};

/**
 * These are options configured for each DataSource instance
 */
export interface ScomDataSourceOptions extends DataSourceJsonData {
  url?: string;
  userName?: string;
  password?: string;
  isSkipTlsVerifyCheck?: boolean;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface SecureJsonData {
  password: string;
}

// Data types.
export interface PerformanceCounter {
  objectname: string;
  countername: string;
  instancename: string;
}

export interface MonitoringClass {
  id: string;
  displayName: string;
  className: string;
  path: string | null;
  fullName: string;
}

export type MonitoringObject = {
  id: string;
  displayName: string;
  path: null | string;
  fullname: string;
  classname: string;
};

export type MonitoringGroup = {
  id: string;
  displayName: string;
  className: string;
  path: null | string;
  fullname: string;
};
