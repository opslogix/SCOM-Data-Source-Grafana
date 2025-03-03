import { AsyncSelect, Button, Field, MultiSelect, RadioButtonList, Select } from '@grafana/ui';
import React, { useState } from 'react';
import { MonitoringClass, MonitoringGroup, MonitoringObject } from 'types';
import { useDs } from './providers/ds.provider';

export default function HealthStateSection() {

    const { query, getState, getStateByGroup, getClasses, getMonitoringObjects, getMonitoringGroups } = useDs();

    const SINGLE_CLASS = 'singleClass';
    const GROUP = 'group';
    const [selectedCategory, setSelectedCategory] = useState<string>(SINGLE_CLASS);

    // const [classes, setClasses] = useState<MonitoringClass[]>([]);

    // useEffect(() => {
    //     const c = async () => {
    //         setClasses(await getClasses(""));
    //     }

    //     c();
    // }, [])
    const [selectedClass, setSelectedClass] = useState<MonitoringClass | undefined | null>(query?.classes?.at(0));
    const [classInstances, setClassInstances] = useState<MonitoringObject[]>([]);
    const [selectedInstances, setSelectedInstances] = useState<MonitoringObject[]>([]);

    const [groups, setGroups] = useState<MonitoringGroup[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<MonitoringGroup | undefined | null>();
    //const [selectedGroupClass, setSelectedGroupClass] = useState<MonitoringClass | undefined | null>();

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
        // if(classes?.length === 0) {
        //     setClasses(await getClasses(''))
        // }

        return await getClasses(inputValue);
    }

    return (
        <div>
            <RadioButtonList
                name="healthStateCategory"
                options={[
                    { label: 'Single Class', value: SINGLE_CLASS },
                    { label: 'Group', value: GROUP },
                ]}
                value={selectedCategory}
                onChange={async (option) => await onCategoryChange(option)}
                className={'radioGroup'}
            />
            {
                selectedCategory === SINGLE_CLASS ? (
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
        </div>
    );
}
