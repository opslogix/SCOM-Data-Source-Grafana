import { AsyncSelect, Box, Button, Field, MultiSelect, RadioButtonGroup, Stack } from '@grafana/ui';
import React, { useEffect, useState } from 'react';
import { MonitoringClass, MonitoringGroup, MonitoringObject, StateQuery } from 'types';
import { useDs } from './providers/ds.provider';
import { SelectableValue } from '@grafana/data';
 
export default function HealthStateSection() {
 
    const { query, getState, getStateByGroup, getClasses, getMonitoringObjects, getMonitoringGroups } = useDs();
    const stateQuery = query as StateQuery;
 
    const options: SelectableValue[] = [{
        label: 'Class',
        value: 'class'
    }, {
        label: 'Group',
        value: 'group'
    }]
 
    const [selectedCategory, setSelectedCategory] = useState<string>();
 
    const [selectedClass, setSelectedClass] = useState<MonitoringClass>();
    const [selectedGroupClass, setSelectedGroupClass] = useState<MonitoringClass>();
 
    const [classInstances, setClassInstances] = useState<MonitoringObject[]>([]);
    const [selectedInstances, setSelectedInstances] = useState<MonitoringObject[]>([]);
 
    const [selectedGroup, setSelectedGroup] = useState<MonitoringGroup>();
 
    const [monitoringGroups] = useState<Promise<MonitoringGroup[]>>(getMonitoringGroups);
    const [monitoringClasses] = useState<Promise<MonitoringClass[]>>(getClasses(''));
 
    useEffect(() => {
        if (!stateQuery) {
            return;
        }
 
        const initialize = async () => {
            if (stateQuery.groups && stateQuery.groups.length > 0) {
                setSelectedGroup(stateQuery.groups.at(0));
                setSelectedCategory("group");
            } else {
                setSelectedCategory("class")
            }
 
            const selectedClass = stateQuery.classes?.[0];
 
            if (selectedClass) {
                setClassInstances([{
                    id: '*',
                    displayName: '*',
                    path: '',
                    fullname: 'All Instances',
                    classname: '',
                }, ...await getMonitoringObjects(selectedClass.className)])
                setSelectedClass(selectedClass);
            }
 
            if (stateQuery.instances && stateQuery.instances.length > 0) {
                setSelectedInstances(stateQuery.instances);
            }
        }
 
        initialize();
 
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
 
    const onClassSelect = async (v?: MonitoringClass | undefined) => {
        if (!v) {
            return;
        }
 
        setSelectedClass(v);
        setSelectedInstances([]);
 
        const instances = await getMonitoringObjects(v.className)
        setClassInstances([
            {
                id: '*',
                displayName: '*',
                path: '',
                fullname: 'All Instances',
                classname: '',
            },
            ...instances
        ]);
    }
 
    const onInstanceSelect = async (v?: MonitoringObject[]) => {
        if (!v) {
            return;
        }
 
        const wildcardMonitoringObject = v.filter(obj => obj.id === '*');
        const isAllSelected = wildcardMonitoringObject.length > 0;
 
        if (isAllSelected) {
            setSelectedInstances(wildcardMonitoringObject)
        } else {
            setSelectedInstances(v);
        }
    }
 
    const onGroupClassSelect = async (v: MonitoringClass) => {
        if (!v) {
            return
        }
 
        setSelectedGroupClass(v);
    }
 
    const onCategoryChange = async (option: string) => {
        setSelectedCategory(option)
    }
 
    const loadClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
        const classes = await monitoringClasses;
 
        return classes.filter((monitoringClass) => monitoringClass.displayName.toLowerCase().includes(inputValue.toLowerCase()));
    }
 
    const loadGroupOptions = async (inputValue: string): Promise<MonitoringGroup[]> => {
        const groups = await monitoringGroups;
        return groups.filter((g) => g.displayName.toLowerCase().includes(inputValue.toLowerCase()));
    }
 
    const loadGroupClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
        const classes = await monitoringClasses;
        const groups = await monitoringGroups;
        return classes.filter((monitoringClass) => !groups.some((group) => group.id === monitoringClass.id) && monitoringClass.displayName.toLowerCase().includes(inputValue.toLowerCase()));
    }
 
    return (
        <>
            <Box padding={1} paddingTop={2}>
                <RadioButtonGroup
                    options={options}
                    value={selectedCategory}
                    onChange={onCategoryChange} />
            </Box>
            <Box padding={1}>
                <Stack direction={'column'} width={'auto'}>
                    {
                        selectedCategory === 'class' ? (
                            <>
                                <Field label="Class">
                                    <AsyncSelect<MonitoringClass>
                                        defaultOptions
                                        loadOptions={loadClassOptions}
                                        getOptionLabel={(v) => v.displayName}
                                        value={selectedClass}
                                        onChange={(v) => onClassSelect(v as MonitoringClass)}
                                    />
                                </Field>
                                <Field label="Instances">
                                    <MultiSelect<MonitoringObject>
                                        options={classInstances}
                                        value={selectedInstances}
                                        getOptionLabel={(v) => v.displayName}
                                        getOptionValue={(v) => v.displayName}
                                        onChange={(v) => onInstanceSelect(v as MonitoringObject[])} />
 
                                </Field>
                                {
                                    selectedClass && selectedInstances.length > 0 && (
                                        <Field>
                                            <Button variant="secondary" icon="search" onClick={() => getState([selectedClass], selectedInstances)}>
                                                Search
                                            </Button>
                                        </Field>
                                    )
                                }
                            </>
                        ) : (
                            <>
                                <Field label="Groups">
                                    <AsyncSelect<MonitoringGroup>
                                        defaultOptions
                                        loadOptions={loadGroupOptions}
                                        value={selectedGroup}
                                        getOptionLabel={(v) => v.displayName}
                                        onChange={(v) => setSelectedGroup(v as MonitoringGroup)}
                                    />
                                </Field>
                                <Field label="Class">
                                    <AsyncSelect<MonitoringClass>
                                        defaultOptions
                                        loadOptions={loadGroupClassOptions}
                                        getOptionLabel={(v) => v.displayName}
                                        value={selectedGroupClass}
                                        onChange={(v) => onGroupClassSelect(v as MonitoringClass)}
                                    />
                                </Field>
                                {
                                    selectedGroup && selectedGroupClass && (
                                        <Button variant="secondary" icon="search" onClick={() => getStateByGroup(selectedGroup, [selectedGroupClass])}>
                                            Search
                                        </Button>
                                    )
                                }
                            </>
                        )}
                </Stack>
            </Box>
        </>
    );
}
                             
