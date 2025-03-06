import { ScomDataSource } from "datasource";
import React, { createContext, useContext } from "react";
import { AlertQuery, MonitoringClass, MonitoringGroup, MonitoringObject, PerformanceCounter, PerformanceQuery, ScomQuery, StateQuery } from "types";

interface DsContextProps {
    query: ScomQuery
    getAlerts: (criteria: string) => Promise<void>
    getState(classes: MonitoringClass[], instances: MonitoringObject[]): Promise<void>
    getStateByGroup(groups: MonitoringGroup, classes: MonitoringClass[]): Promise<void>
    getPerformance: (counters: PerformanceCounter[], classes: MonitoringClass[], instances?: MonitoringObject[], groups?: MonitoringGroup[]) => Promise<void>;
    getClasses: (criteria: string) => Promise<MonitoringClass[]>;
    getMonitoringObjects: (criteria: string) => Promise<MonitoringObject[]>;
    getMonitoringObjectsByGroup: (groupClassName: string) => Promise<MonitoringObject[]>;
    getClassesForObject: (id: string) => Promise<MonitoringClass[]>;
    getMonitoringGroups: () => Promise<MonitoringGroup[]>;
    getPerformanceCounters: (className: string) => Promise<PerformanceCounter[]>;
}

interface DsProviderProps {
    children?: React.ReactNode;
    query: ScomQuery
    onChange: (query: ScomQuery) => void;
    onRunQuery: () => void;
    datasource: ScomDataSource;
}

const DsContext = createContext<DsContextProps | undefined>(undefined);

export const DsProvider = ({ children, datasource, query, onChange, onRunQuery }: DsProviderProps) => {

    //getDefaultQuery doesn't seem to work as expected?. forcing default query here..
    if (query.type == null) {
        const defaultQuery: AlertQuery = {
            ...query,
            type: 'alerts',
            criteria: 'Severity = 2 AND ResolutionState = 0'
        }

        query = defaultQuery;
    }

    const values = {
        getClasses: async (query?: string) => {
            const classes = await datasource.getResource<MonitoringClass[]>('getClasses', { query });
            return classes;
        },
        getMonitoringObjects: async (className?: string) => {
            const instances = await datasource.getResource<MonitoringObject[]>('getObjects', { className });
            return instances;
        },
        getMonitoringObjectsByGroup: async (groupId: string) => {
            const groupInstances = await datasource.getResource<MonitoringObject[]>('getObjectsByGroup', { classIdGroup: groupId })
            return groupInstances
        },
        getMonitoringGroups: async () => {
            const groups = await datasource.getResource<MonitoringGroup[]>('getGroups', { criteria: '' });
            return groups;
        },
        getMonitors: async () => {
            return await datasource.getResource('getMonitors', { criteria: '' });
        },
        getPerformanceCounters: async (performanceObjectId: string) => {
            const counters = await datasource.getResource<PerformanceCounter[]>('getCounters', { performanceObjectId });
            return counters;
        },
        getPerformance: async (counters: PerformanceCounter[], classes: MonitoringClass[], instances?: MonitoringObject[], groups?: MonitoringGroup[]) => {
            const performanceQuery: PerformanceQuery = {
                ...query,
                type: 'performance',
                groups,
                classes,
                counters,
                instances
            }

            onChange(performanceQuery);

            onRunQuery();
        },
        getAlerts: async (criteria: string) => {
            const alertQuery: AlertQuery = {
                ...query,
                type: 'alerts',
                criteria
            }

            onChange(alertQuery);
            onRunQuery();
        },
        getState: async (classes: MonitoringClass[], instances: MonitoringObject[]) => {
            const stateQuery: StateQuery = {
                ...query,
                type: 'state',
                classes,
                groups: undefined,
                instances
            }
            onChange(stateQuery);
            onRunQuery();
        },
        getStateByGroup: async (group: MonitoringGroup, classes: MonitoringClass[]) => {
            const stateQuery: StateQuery = {
                ...query,
                type: 'state',
                groups: [group],
                classes,
                instances: undefined
            }
            onChange(stateQuery)
            onRunQuery();
        },
        getClassesForObject: async (id: string) => {
            const classes = await datasource.getResource<MonitoringClass[]>('getClassesForObject', { objectId: id });
            return classes;
        },
        query
    }

    return (
        <DsContext.Provider value={values}>
            {children}
        </DsContext.Provider>
    );
}

export const useDs = () => {
    const context = useContext(DsContext);
    if (context === undefined) {
        throw new Error('useDs must be used within a DsProvider');
    }

    return context;
}
