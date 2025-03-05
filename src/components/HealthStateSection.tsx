import { AsyncSelect, Box, Button, Field, MultiSelect, RadioButtonGroup, Select, Stack } from '@grafana/ui';
import React, { useState } from 'react';
import { MonitoringClass, MonitoringGroup, MonitoringObject, StateQuery } from 'types';
import { useDs } from './providers/ds.provider';

export default function HealthStateSection() {

    const { query, getState, getStateByGroup, getClasses, getMonitoringObjects, getMonitoringGroups } = useDs();
    const stateQuery = query as StateQuery;

    const SINGLE_CLASS = 'class';
    const GROUP = 'group';
    const [selectedCategory, setSelectedCategory] = useState<string>(SINGLE_CLASS);

    const [selectedClass, setSelectedClass] = useState<MonitoringClass | undefined | null>(stateQuery?.classes?.at(0));
    const [classInstances, setClassInstances] = useState<MonitoringObject[]>([]);
    const [selectedInstances, setSelectedInstances] = useState<MonitoringObject[]>([]);

    const [groups, setGroups] = useState<MonitoringGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<MonitoringGroup | undefined | null>();

    const onClassSelect = async (v?: MonitoringClass | undefined) => {
        if (v === undefined) {
            return;
        }

        setSelectedClass(v);
        setSelectedInstances([]);
        setClassInstances(await getMonitoringObjects(v.className));
    }

    const onCategoryChange = async (option: string) => {
        setSelectedCategory(option)
        setGroups(await getMonitoringGroups());
    }

    const loadClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
        return await getClasses(inputValue);
    }

    return (
        <>
            <Box padding={1} paddingTop={2}>
                <RadioButtonGroup
                    options={[
                        { label: 'Class', value: SINGLE_CLASS },
                        { label: 'Group', value: GROUP },
                    ]}
                    value={selectedCategory}
                    onChange={async (option) => await onCategoryChange(option)} />
            </Box>
            <Box padding={1}>
                <Stack direction={'column'} width={'auto'}>
                    {
                        selectedCategory === 'class' ? (
                            <>
                                <Field label="Class">
                                    <AsyncSelect<MonitoringClass>
                                        defaultOptions={true}
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
                                        onChange={(v) => setSelectedInstances(v as MonitoringObject[])} />

                                </Field>
                                {
                                    selectedClass && selectedInstances.length > 0 && (
                                        <Button variant="secondary" icon="search" onClick={() => getState([selectedClass], selectedInstances)}>
                                            Search
                                        </Button>
                                    )
                                }
                            </>
                        ) : (
                            <>
                                <Field label="Groups">
                                    <Select<MonitoringGroup>
                                        options={groups}
                                        value={selectedGroup}
                                        getOptionLabel={(v) => v.displayName}
                                        onChange={(v) => setSelectedGroup(v as MonitoringGroup)}
                                    />
                                </Field>
                                <Field label="Class">
                                    <AsyncSelect<MonitoringClass>
                                        defaultOptions={true}
                                        loadOptions={loadClassOptions}
                                        getOptionLabel={(v) => v.displayName}
                                        value={selectedClass}
                                        onChange={(v) => onClassSelect(v as MonitoringClass)}
                                    />
                                </Field>
                                {
                                    selectedGroup && selectedClass && (
                                        <Button variant="secondary" icon="search" onClick={() => getStateByGroup(selectedGroup, [selectedClass])}>
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
