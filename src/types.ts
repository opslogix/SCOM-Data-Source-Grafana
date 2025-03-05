import { DataSourceJsonData } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface ScomQuery extends DataQuery {
  type: 'state' | 'alerts' | 'performance'
}

export interface StateQuery extends ScomQuery {
  type: 'state';
  classes?: MonitoringClass[];
  groups?: MonitoringGroup[];
  instances?: MonitoringObject[];
}

export interface AlertQuery extends ScomQuery {
  type: 'alerts';
  criteria?: string;
}

export interface PerformanceQuery extends ScomQuery {
  type: 'performance';
  classes?: MonitoringClass[];
  counters?: PerformanceCounter[];
  groups?: MonitoringGroup[];
  instances?: MonitoringObject[];
}

export const DEFAULT_QUERY: Partial<AlertQuery> = {
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
  objectName: string;
  counterName: string;
  instanceName: string;
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
