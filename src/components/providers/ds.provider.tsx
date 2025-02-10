import { ScomDataSource } from "datasource";
import React, { createContext, useContext } from "react";
import { MonitoringClass, MonitoringGroup, MonitoringObject, MyQuery, PerformanceCounter } from "types";

interface DsContextProps {
    query: MyQuery
    getAlerts: (criteria: string) => Promise<void>
    getState(classes: MonitoringClass[], instances: MonitoringObject[]): Promise<void>
    getStateByGroup(groups: MonitoringGroup, classes: MonitoringClass[]): Promise<void>
    getPerformance: (instances: MonitoringObject[], counters: PerformanceCounter[], classes: MonitoringClass[]) => Promise<void>;
    getClasses: (criteria: string) => Promise<MonitoringClass[]>;
    getMonitoringObjects: (criteria: string) => Promise<MonitoringObject[]>;
    getMonitoringGroups: () => Promise<MonitoringGroup[]>;
    // getMonitors: () => Promise<any>;
    //Executes grafana query
    getPerformanceCounters: (className: string) => Promise<PerformanceCounter[]>;
}

interface DsProviderProps {
    children?: React.ReactNode;
    query: MyQuery
    onChange: (query: MyQuery) => void;
    onRunQuery: () => void;
    datasource: ScomDataSource;
}

const DsContext = createContext<DsContextProps | undefined>(undefined);

export const DsProvider = ({ children, datasource, query, onChange, onRunQuery }: DsProviderProps) => {
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
        getPerformance: async (instances: MonitoringObject[], counters: PerformanceCounter[], classes: MonitoringClass[]) => {
            //Execute actual query
            console.log('getPerformance: ', instances, counters);
            onChange({
                ...query,
                type: "performance",
                classes,
                counters,
                instances
            });
            onRunQuery();
        },
        getAlerts: async (criteria: string) => {
            console.log('getAlerts: ', criteria)
            onChange({
                ...query,
                type: "alerts",
                criteria
            });
            onRunQuery();
        },
        getState: async (classes: MonitoringClass[], instances: MonitoringObject[]) => {
            console.log('getState', classes, instances);
            onChange({
                ...query,
                type: "state",
                groups: undefined,
                classes,
                instances
            });
            onRunQuery();
        },
        getStateByGroup: async (group: MonitoringGroup, classes: MonitoringClass[]) => {
            console.log('getStateByGroup', group, classes);
            onChange({
                ...query,
                type: "state",
                groups: [group],
                classes,
                instances: undefined
                
            })
            onRunQuery();
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
