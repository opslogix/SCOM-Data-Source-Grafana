import React, { useEffect, useState } from 'react';
import { AsyncSelect, Box, Button, Field, MultiSelect, RadioButtonGroup, Select, Stack } from '@grafana/ui';
import { useDs } from './providers/ds.provider';
import { MonitoringClass, MonitoringGroup, MonitoringObject, PerformanceCounter, PerformanceQuery } from 'types';
import { SelectableValue } from '@grafana/data';

export default function PerformanceSection() {
  const { getClasses, getMonitoringObjects, getMonitoringGroups, getPerformanceCounters, getPerformance, query } = useDs();
  const performanceQuery = query as PerformanceQuery;

  const options: SelectableValue[] = [
    { label: 'Class', value: 'class' },
    { label: 'Group', value: 'group' },
  ];

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

      if (performanceQuery.instances) {
        setSelectedClassInstances(performanceQuery.instances);
        if (performanceQuery.instances[0].id === '*') {
          const a = performanceQuery.classes?.at(0)?.className
          if (a) {
            const allInstances = await getMonitoringObjects(a)
            if (allInstances?.length) {
              console.log('s  ')
              setPerformanceCounters(await getPerformanceCounters([allInstances[0].id]));
            }
          }
        } else {
          setPerformanceCounters(await getPerformanceCounters(performanceQuery.instances.map((x) => x.id)));
        }
      }

      if (performanceQuery.groups?.length) {
        setSelectedGroup(performanceQuery.groups[0]);
        setSelectedGroupClass(performanceQuery.classes?.[0]);
        setSelectedCategory('group');
        setSelectedGroupPerformanceCounter(performanceQuery.counters?.[0]);
      } else {
        const selectedCls = performanceQuery.classes?.[0];
        if (selectedCls) {
          setSelectedClass(selectedCls);
          const objs = await getMonitoringObjects(selectedCls.className);

          const allMonitoringObject: MonitoringObject = {
            id: '*',
            displayName: '*',
            path: '',
            fullname: 'All Instances',
            classname: '',
          };

          const allOption: SelectableValue<MonitoringObject> = {
            label: 'All',
            value: allMonitoringObject,
            ...allMonitoringObject,
          };

          setMonitoringObjects([allOption, ...objs]);
        }
        setSelectedCategory('class');
        if (performanceQuery.instances?.length) {
          setSelectedClassInstances(performanceQuery.instances);
        }
        setSelectedPerformanceCounter(performanceQuery.counters?.[0]);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onClassSelect = async (v?: MonitoringClass) => {

    if (!v) {
      return;
    }

    setSelectedClass(v);
    setSelectedClassInstances([]);
    setSelectedPerformanceCounter(undefined);

    const objs = await getMonitoringObjects(v.className);
    if (objs.length === 0) {
      return setMonitoringObjects([objs]);
    }

    //Add wildcard monitoring object if there are any objects
    const allMonitoringObject: MonitoringObject = {
      id: '*',
      displayName: '*',
      path: '',
      fullname: 'All Monitoring Objects',
      classname: '',
    };

    const allOption: SelectableValue<MonitoringObject> = {
      label: 'All',
      value: allMonitoringObject,
      ...allMonitoringObject,
    };

    return setMonitoringObjects([allOption, ...objs]);
  };

  const onInstanceSelect = async (v?: MonitoringObject[]) => {

    if (!v) {
      return;
    }

    const wildcardMonitoringObject = v.filter(obj => obj.id === '*');
    const isAllSelected = wildcardMonitoringObject.length > 0;

    if (isAllSelected && monitoringObjects) {

      console.log('wildcard used')
      //Wildcard used, get all actual instances for class and retrieve performance counters
      const allInstances = monitoringObjects.filter((obj) => obj.id !== '*');

      //Set selected instance to the wildcard object
      setSelectedClassInstances(wildcardMonitoringObject);
      setPerformanceCounters(await getPerformanceCounters(allInstances.map((x) => x.id)));
    } else {
      console.log('test')
      setSelectedClassInstances(v);
      if (v.length) {
        setPerformanceCounters(await getPerformanceCounters(v.map((x) => x.id)));
      }
    }
  };

  const onPerformanceCounterSelect = async (v?: PerformanceCounter) => {
    if (v) {
      setSelectedPerformanceCounter(v);
    }
  };

  const onGroupSelect = async (group?: MonitoringGroup) => {
    if (group) {
      setSelectedGroup(group);
    }
  };

  const onGroupClassSelect = async (v?: MonitoringClass) => {
    if (!v) {
      return;
    }
    setSelectedGroupClass(v);
    const classInstances = await getMonitoringObjects(v.className);
    if (!classInstances?.length) {
      setPerformanceCounters([]);
    } else {
      setPerformanceCounters(await getPerformanceCounters(classInstances.map((x) => x.id)));
    }
  };

  const onGroupPerformanceCounterSelect = async (v?: PerformanceCounter) => {
    setSelectedGroupPerformanceCounter(v);
  };

  const onCategoryChange = async (category: string) => {
    setSelectedCategory(category);
  };

  const loadClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
    const classes = await monitoringClasses;
    return classes.filter((cls) => cls.displayName.toLowerCase().includes(inputValue.toLowerCase()));
  };

  const loadGroupClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
    const classes = await monitoringClasses;
    const groups = await monitoringGroups;
    return classes.filter(
      (cls) =>
        !groups.some((group) => group.id === cls.id) &&
        cls.displayName.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadGroupOptions = async (inputValue: string): Promise<MonitoringGroup[]> => {
    const groups = await monitoringGroups;
    return groups.filter((g) => g.displayName.toLowerCase().includes(inputValue.toLowerCase()));
  };

  return (
    <>
      <Box padding={1} paddingTop={2}>
        <RadioButtonGroup options={options} value={selectedCategory} onChange={onCategoryChange} />
      </Box>
      <Box padding={1}>
        <Stack direction="column" width="auto">
          {selectedCategory === 'class' && (
            <>
              <Field label="Class">
                <AsyncSelect<MonitoringClass>
                  maxMenuHeight={200}
                  defaultOptions
                  value={selectedClass}
                  getOptionLabel={(v) => v.displayName}
                  loadOptions={loadClassOptions}
                  onChange={(v) => onClassSelect(v as MonitoringClass)}
                  cacheOptions
                />
              </Field>

              {selectedClass && (
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
              )}

              {selectedClassInstances && (
                <Field label="Counter">
                  <Select<PerformanceCounter>
                    getOptionLabel={(v) =>
                      `${v.counterName} - ${v.objectName}${v.instanceName ? ` - ${v.instanceName}` : ''}`
                    }
                    value={selectedPerformanceCounter}
                    options={performanceCounters}
                    onChange={(v) => onPerformanceCounterSelect(v as PerformanceCounter)}
                  />
                </Field>
              )}

              {selectedPerformanceCounter && selectedClassInstances && selectedClass && (
                <Field>
                  <Button
                    variant="secondary"
                    icon="thumbs-up"
                    onClick={() =>
                      getPerformance([selectedPerformanceCounter], [selectedClass], selectedClassInstances as MonitoringObject[])
                    }
                  >
                    Apply
                  </Button>
                </Field>
              )}
            </>
          )}

          {selectedCategory === 'group' && (
            <>
              <Field label="Group">
                <AsyncSelect<MonitoringGroup>
                  defaultOptions
                  maxMenuHeight={200}
                  getOptionLabel={(v) => v.displayName}
                  value={selectedGroup}
                  loadOptions={loadGroupOptions}
                  onChange={(v) => onGroupSelect(v as MonitoringGroup)}
                />
              </Field>

              {selectedGroup && (
                <Field label="Class">
                  <AsyncSelect<MonitoringClass>
                    maxMenuHeight={200}
                    defaultOptions
                    value={selectedGroupClass}
                    getOptionLabel={(v) => v.displayName}
                    loadOptions={loadGroupClassOptions}
                    onChange={(v) => onGroupClassSelect(v as MonitoringClass)}
                    cacheOptions
                  />
                </Field>
              )}

              {selectedGroup && selectedGroupClass && (
                <Field label="Counter">
                  <Select<PerformanceCounter>
                    getOptionLabel={(v) => v.counterName}
                    value={selectedGroupPerformanceCounter}
                    options={performanceCounters}
                    onChange={(v) => onGroupPerformanceCounterSelect(v as PerformanceCounter)}
                  />
                </Field>
              )}

              {selectedGroup && selectedGroupClass && selectedGroupPerformanceCounter && (
                <Field>
                  <Button
                    variant="secondary"
                    icon="thumbs-up"
                    onClick={() =>
                      getPerformance([selectedGroupPerformanceCounter], [selectedGroupClass], undefined, [selectedGroup])
                    }
                  >
                    Apply
                  </Button>
                </Field>
              )}
            </>
          )}
        </Stack>
      </Box>
    </>
  );
}
