import React, { useEffect, useState } from 'react';
import { AsyncSelect, Box, Button, Field, MultiSelect, RadioButtonGroup, Select, Stack } from '@grafana/ui';
import { useDs } from './providers/ds.provider';
import { MonitoringClass, MonitoringGroup, MonitoringObject, PerformanceCounter, PerformanceQuery } from 'types';
import { SelectableValue } from '@grafana/data';

export default function PerformanceSection() {

  const { getClasses, getMonitoringObjects, getMonitoringGroups, getPerformanceCounters, getPerformance, query } = useDs();
  const performanceQuery = query as PerformanceQuery;

  const options: SelectableValue[] = [{
    label: 'Class',
    value: 'class'
  }, {
    label: 'Group',
    value: 'group'
  }]

  const [selectedCategory, setSelectedCategory] = useState<string>();

  const [selectedClass, setSelectedClass] = useState<MonitoringClass>();
  const [selectedClassInstances, setSelectedClassInstances] = useState<Array<SelectableValue<MonitoringObject>>>();
  const [selectedPerformanceCounter, setSelectedPerformanceCounter] = useState<PerformanceCounter>();

  const [selectedGroup, setSelectedGroup] = useState<MonitoringGroup>();
  const [selectedGroupClass, setSelectedGroupClass] = useState<MonitoringClass>();
  const [selectedGroupPerformanceCounter, setSelectedGroupPerformanceCounter] = useState<PerformanceCounter>();
  const [performanceCounters, setPerformanceCounters] = useState<PerformanceCounter[]>([]);
  const [monitoringObjects, setMonitoringObjects] = useState<Array<SelectableValue<MonitoringObject>>>();

  const [monitoringGroups] = useState<Promise<MonitoringGroup[]>>(getMonitoringGroups);
  const [monitoringClasses] = useState<Promise<MonitoringClass[]>>(getClasses(''));

  useEffect(() => {
    if (!performanceQuery) {
      return;
    }

    const initialize = async () => {
      if (performanceQuery?.instances) {
        setSelectedClassInstances(performanceQuery.instances)
        setPerformanceCounters(await getPerformanceCounters(performanceQuery.instances.map(x => x.id)))
      }

      if (performanceQuery?.groups && performanceQuery.groups.length > 0) {
        //Group configuration
        setSelectedGroup(performanceQuery.groups.at(0));
        setSelectedGroupClass(performanceQuery.classes?.at(0));
        setSelectedCategory("group");
        setSelectedGroupPerformanceCounter(performanceQuery?.counters?.at(0));
      } else {
        //Class configuration
        const selectedClass = performanceQuery.classes?.at(0)
        if (selectedClass) {
          setSelectedClass(selectedClass);
          setMonitoringObjects(await getMonitoringObjects(selectedClass.className))
        }
        setSelectedCategory("class");

        if (performanceQuery.instances && performanceQuery.instances.length > 0) {
          setSelectedClassInstances(performanceQuery.instances)
        }

        setSelectedPerformanceCounter(performanceQuery?.counters?.at(0))
      }
    }

    initialize();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onClassSelect = async (v?: MonitoringClass | undefined) => {
    if (v === undefined) {
      return;
    }

    setSelectedClass(v);
    setSelectedClassInstances([]);
    setSelectedPerformanceCounter(undefined);
    setMonitoringObjects(await getMonitoringObjects(v.className));
  }

  const onGroupClassSelect = async (v?: MonitoringClass) => {
    if (v === undefined) {
      return;
    }

    setSelectedGroupClass(v);
    const classInstances = await getMonitoringObjects(v.className);
    if (!classInstances || classInstances.length === 0) {
      setPerformanceCounters([]);
    } else {
      setPerformanceCounters(await getPerformanceCounters(classInstances.map(x => x.id)));
    }
  }

  const onInstanceSelect = async (v?: MonitoringObject[] | undefined) => {
    if (v == null) {
      return;
    }

    console.log(v);
    setSelectedClassInstances(v);
    if (v.length > 0) {
      setPerformanceCounters(await getPerformanceCounters(v.map(x => x.id)));
    }
  }

  const onPerformanceCounterSelect = async (v?: PerformanceCounter | undefined) => {
    if (v === undefined) {
      return;
    }

    setSelectedPerformanceCounter(v);
  }

  const onGroupPerformanceCounterSelect = async (v?: PerformanceCounter) => {
    setSelectedGroupPerformanceCounter(v);
  }

  const onGroupSelect = async (group?: MonitoringGroup | undefined) => {
    if (group === undefined) {
      return;
    }
    setSelectedGroup(group);
  }

  const onCategoryChange = async (category: string) => {
    setSelectedCategory(category)
  }

  const loadClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
    const classes = await monitoringClasses;

    return classes.filter((monitoringClass) => monitoringClass.displayName.toLowerCase().includes(inputValue.toLowerCase()));
  }

  const loadGroupClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
    const classes = await monitoringClasses;
    const groups = await monitoringGroups;
    return classes.filter((monitoringClass) => !groups.some((group) => group.id === monitoringClass.id) && monitoringClass.displayName.toLowerCase().includes(inputValue.toLowerCase()));
  }

  const loadGroupOptions = async (inputValue: string): Promise<MonitoringGroup[]> => {
    const groups = await monitoringGroups;
    return groups.filter((g) => g.displayName.toLowerCase().includes(inputValue.toLowerCase()));
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
            selectedCategory === "class" && (
              <>
                <Field label="Class">
                  <AsyncSelect<MonitoringClass>
                    maxMenuHeight={200}
                    defaultOptions={true}
                    value={selectedClass}
                    getOptionLabel={(v) => v.displayName}
                    loadOptions={loadClassOptions}
                    onChange={(v) => onClassSelect(v as MonitoringClass)}
                    cacheOptions={true}
                  />
                </Field>
                {
                  selectedClass && (
                    <Field label="Instance">
                      <MultiSelect<MonitoringObject>
                        maxMenuHeight={200}
                        getOptionLabel={(v) => v.displayName}
                        getOptionValue={(v) => v.displayName}
                        value={selectedClassInstances}
                        options={monitoringObjects}
                        onChange={(v) => onInstanceSelect(v as MonitoringObject[])}
                      />
                    </Field>
                  )
                }
                {
                  selectedClassInstances && (
                    <Field label="Counter">
                      <Select<PerformanceCounter>
                        getOptionLabel={(v) => `${v.counterName} - ${v.objectName}` + (v.instanceName ? ` - ${v.instanceName}` : '')}
                        value={selectedPerformanceCounter}
                        options={performanceCounters}
                        onChange={(v) => onPerformanceCounterSelect(v as PerformanceCounter)} />
                    </Field>
                  )
                }
                {
                  selectedPerformanceCounter && selectedClassInstances && selectedClass && (
                    <Field>
                      <Button variant="secondary" icon="thumbs-up" onClick={() => getPerformance([selectedPerformanceCounter], [selectedClass], selectedClassInstances as MonitoringObject[])}>
                        Apply
                      </Button>
                    </Field>
                  )
                }
              </>
            )
          }
          {
            selectedCategory === "group" && (
              <>
                <Field label="Group">
                  <AsyncSelect<MonitoringGroup>
                    defaultOptions={true}
                    maxMenuHeight={200}
                    getOptionLabel={(v) => v.displayName}
                    value={selectedGroup}
                    loadOptions={loadGroupOptions}
                    onChange={(v) => onGroupSelect(v as MonitoringGroup)}
                  />
                </Field>
                {
                  selectedGroup && (
                    <Field label="Class">
                      <AsyncSelect<MonitoringClass>
                        maxMenuHeight={200}
                        defaultOptions={true}
                        value={selectedGroupClass}
                        getOptionLabel={(v) => v.displayName}
                        loadOptions={loadGroupClassOptions}
                        onChange={(v) => onGroupClassSelect(v as MonitoringClass)}
                        cacheOptions={true}
                      />
                    </Field>
                  )
                }
                {
                  selectedGroup && selectedGroupClass && (
                    <Field label="Counter">
                      <Select<PerformanceCounter>
                        getOptionLabel={(v) => v.counterName}
                        value={selectedGroupPerformanceCounter}
                        options={performanceCounters}
                        onChange={(v) => onGroupPerformanceCounterSelect(v as PerformanceCounter)} />
                    </Field>
                  )
                }
                {
                  selectedGroup && selectedGroupClass && selectedGroupPerformanceCounter && (
                    <Field>
                      <Button variant="secondary" icon="thumbs-up" onClick={() => getPerformance([selectedGroupPerformanceCounter], [selectedGroupClass], undefined, [selectedGroup])}>
                        Apply
                      </Button>
                    </Field>
                  )
                }
              </>
            )
          }
        </Stack>
      </Box>
    </>
  );
}
