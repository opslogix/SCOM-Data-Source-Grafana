import { ScomDataSource } from "datasource";
import React, { createContext, useContext } from "react";
import { AlertQuery, MonitoringClass, MonitoringGroup, MonitoringObject, PerformanceCounter, PerformanceQuery, ScomQuery, StateQuery } from "types";

interface DsContextProps {
    query: ScomQuery
    setActiveQuery: (query: any) => Promise<void>
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
            console.log('getClasses', query);
            const classes = await datasource.getResource<MonitoringClass[]>('getClasses', { query });
            console.log('getClasses: classes', classes);
            return classes;
        },
        getMonitoringObjects: async (className?: string) => {
            console.log('getMonitoringObjects', className);
            const instances = await datasource.getResource<MonitoringObject[]>('getObjects', { className });
            console.log('getMonitoringObjects: instances', instances);
            return instances;
        },
        getMonitoringObjectsByGroup: async (groupId: string) => {
            console.log('getMonitoringObjectsByGroup', groupId);
            const groupInstances = await datasource.getResource<MonitoringObject[]>('getObjectsByGroup', { classIdGroup: groupId })
            console.log('getMonitoringObjectsByGroup: instances', groupInstances);
            return groupInstances
        },
        getMonitoringGroups: async () => {
            console.log('getMonitoringGroups');
            const groups = await datasource.getResource<MonitoringGroup[]>('getGroups', { criteria: '' });
            console.log('getMonitoringGroups: groups', groups);
            return groups;
        },
        getMonitors: async () => {
            console.log('getMonitors');
            return await datasource.getResource('getMonitors', { criteria: '' });
        },
        getPerformanceCounters: async (performanceObjectId: string) => {
            console.log('getPerformanceCounters: id', performanceObjectId);
            const counters = await datasource.getResource<PerformanceCounter[]>('getCounters', { performanceObjectId });
            console.log('getPerformanceCounters: counters', counters);

            return counters;
        },
        getPerformance: async (counters: PerformanceCounter[], classes: MonitoringClass[], instances?: MonitoringObject[], groups?: MonitoringGroup[]) => {
            //Execute actual query
            console.log('getPerformance: ', instances, counters, groups);

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
            console.log('getAlerts: ', criteria)

            const alertQuery: AlertQuery = {
                ...query,
                type: 'alerts',
                criteria
            }

            onChange(alertQuery);
            onRunQuery();
        },
        getState: async (classes: MonitoringClass[], instances: MonitoringObject[]) => {
            console.log('getState', classes, instances);
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
            console.log('getStateByGroup', group, classes);
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
            console.log('getClassesForObject: id', id);
            const classes = await datasource.getResource<MonitoringClass[]>('getClassesForObject', { objectId: id });
            console.log('getClassesForObject: classes', classes);
            return classes;
        },
        setActiveQuery: async (query: any) => {

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
