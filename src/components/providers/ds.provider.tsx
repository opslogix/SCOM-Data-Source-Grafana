import { ScomDataSource } from "datasource";
import React, { createContext, useContext, useState } from "react";
import { MonitoringClass, MonitoringGroup, MonitoringObject, MyQuery, PerformanceCounter } from "types";

interface DsContextProps {
    getClasses: (criteria: string) => Promise<MonitoringClass[]>;
    getMonitoringObjects: (criteria: string) => Promise<MonitoringObject[]>;
    getMonitoringGroups: () => Promise<any>;
    getMonitors: () => Promise<any>;
    getPerformance: () => Promise<any>;
    counters: () => Promise<PerformanceCounter[]>;
}

interface DsProviderProps {
    children?: React.ReactNode;
    query: MyQuery
    onChange: (query: MyQuery) => void;
    onRunQuery: () => void;
    datasource: ScomDataSource;
}

const DsContext = createContext<DsContextProps | undefined>(undefined);

export const DsProvider = ({ children, datasource}: DsProviderProps) => {

    // const [groups, setGroups] = useState<any[]>([]);
    // const [instances, setInstances] = useState<any[]>([]);
    // const [classes, setClasses] = useState<any[]>([]);
    // const [monitors, setMonitors] = useState<any[]>([]);
    // const [performance, setPerformance] = useState<any[]>([]);
    // const [groupsData, setGroupsData] = useState<any[]>([]);

    //   useEffect(() => {
    //     // Fetch all groups and save in state for filtering them out from all the classes.
    //     const fetchGroups = async () => {
    //       try {
    //         const groups = await datasource.getResource('getGroups', { groupQueryCriteria: '' });
    //         setGroupsData(groups);
    //       } catch (error) {
    //         console.log('group data error: ', error);
    //       }
    //     };
    
    //     fetchGroups();
    //   }, [datasource]);

    const [cachedCounters, setCounters] = useState<PerformanceCounter[]>([]);

    const values = {
        getClasses: async (query?: string) => {
            console.log('getClasses', query);
            const classes = await datasource.getResource<MonitoringClass[]>('getClasses', { query });
            console.log('getClasses: classes', classes);
            return classes;
        },
        getMonitoringObjects: async (className?: string) => {
            console.log('getMonitoringObjects', className);
            const instances = await datasource.getResource<MonitoringObject[]>('getObjects', {  className  });
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
        getPerformance: async () => {
            console.log('getPerformance');
            return await datasource.getResource('getPerformance', { criteria: '' });
        },
        counters: async () => {
            if(cachedCounters?.length > 0) {
                console.log('cachedCounters', cachedCounters);
                return cachedCounters;
            }

            const counters = await datasource.getResource<PerformanceCounter[]>('getCounters', { criteria: '' });
            console.log('counters');
            setCounters(counters);
            return counters;    
        }
    }

    return (
        <DsContext.Provider value={values}>
            {children}
        </DsContext.Provider>
    );
}

export const useDs = () => {
    const context = useContext(DsContext);
    if(context === undefined) {
        throw new Error('useDs must be used within a DsProvider');
    }

    return context;
}
