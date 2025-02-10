import React, { useState } from 'react';
import { AsyncSelect, Button, Field, RadioButtonList, Select } from '@grafana/ui';
import { useDs } from './providers/ds.provider';
import { MonitoringClass, MonitoringGroup, MonitoringObject, PerformanceCounter } from 'types';

export default function PerformanceSection() {

  const { getClasses, getMonitoringObjects, getPerformanceCounters, getPerformance, query } = useDs();

  const SINGLE_CLASS = 'singleClass';
  const GROUP = 'group';
  const [selectedRadioOption, setSelectedRadioOption] = useState(SINGLE_CLASS);

  const [selectedClass, setSelectedClass] = useState<MonitoringClass | undefined | null>(query?.classes?.at(0));
  const [selectedInstance, setSelectedInstance] = useState<MonitoringObject | undefined | null>(query?.instances?.at(0));
  const [classInstances, setClassInstances] = useState<MonitoringObject[]>([]);
  const [performanceCounters, setPerformanceCounters] = useState<PerformanceCounter[]>([]);
  const [selectedPerformanceCounter, setSelectedPerformanceCounter] = useState<PerformanceCounter | undefined | null>(query?.counters?.at(0));

  const onClassSelect = async (v?: MonitoringClass | undefined) => {
    if (v === undefined) {
      return;
    }

    setSelectedClass(v);
    setSelectedInstance(null);
    setClassInstances(await getMonitoringObjects(v.className));
  }

  const onInstanceSelect = async (v?: MonitoringObject | undefined) => {
    if (v == null) {
      return;
    }

    setSelectedInstance(v);
    setPerformanceCounters(await getPerformanceCounters(v.id));
  }

  const onPerformanceCounterSelect = async (v?: PerformanceCounter | undefined) => {
    if (v === undefined) {
      return;
    }

    setSelectedPerformanceCounter(v);
    //Execute query?
  }

  const loadClassOptions = async (inputValue: string): Promise<MonitoringClass[]> => {
    return await getClasses(inputValue);
  }

  return (
    <>
      <RadioButtonList
        name="PerformanceCategory"
        options={[
          { label: 'Class', value: SINGLE_CLASS },
          { label: 'Group', value: GROUP },
        ]}
        value={selectedRadioOption}
        onChange={(option) => setSelectedRadioOption(option)}
        className={'radioGroup'}
      />
      {
        selectedRadioOption === SINGLE_CLASS ? (
          <>
              <AsyncSelect<MonitoringClass>
                defaultOptions={true}
                value={selectedClass}
                getOptionLabel={(v) => v.displayName}
                loadOptions={loadClassOptions}
                onChange={(v) => onClassSelect(v as MonitoringClass)}
                cacheOptions={true}
              />
              <Select<MonitoringObject>
                disabled={selectedClass == null}
                getOptionLabel={(v) => v.displayName}
                value={selectedInstance}
                options={classInstances}
                onChange={(v) => onInstanceSelect(v as MonitoringObject)}
              />

            {
              selectedInstance && (
                  <Select<PerformanceCounter>
                    disabled={selectedInstance == null}
                    getOptionLabel={(v) => v.counterName}
                    value={selectedPerformanceCounter}
                    options={performanceCounters}
                    onChange={(v) => onPerformanceCounterSelect(v as PerformanceCounter)} />

              )
            }
            {
              selectedPerformanceCounter && selectedInstance && selectedClass && (
                <Field>
                  <Button variant="secondary" icon="thumbs-up" onClick={() => getPerformance([selectedInstance], [selectedPerformanceCounter], [selectedClass])}>
                    Apply
                  </Button>
                </Field>
              )
            }
          </>
        ) : (
          <>
            <Select<MonitoringGroup>
              getOptionLabel={(v) => v.displayName}
              value={null}
              options={[]}
              onChange={() => { }}
            />
          </>
        )
      }
    </>
  );
  // async function onSelectClassGroup(selectedClass: ClassData) {
  //   try {
  //     // Fetch healthstate data, since that is the only way to know which objects belong to the chosen group and class.
  //     const objects = await datasource.getResource('getObjectsByGroup', {
  //       groupId: selectedGroup?.id,
  //       classIdGroup: selectedClass?.id,
  //     });

  //     console.log(objects);
  //     // Save all the object of the health states data, to later use them to fetch performance data for each id.
  //     setObjectsGroup(objects?.rows);

  //     // Since all objects have same counters, we take one of the object ids and fetch counters.
  //     if (objects?.rows.length > 0) {
  //       getCounters(objects?.rows[0]);
  //     }
  //   } catch (error) {
  //     console.log('getObjects error: ', error);
  //   }
  // }
  // async function onSelectClass(selectedClass: ClassData) {
  //   setResetObjectsData(true);
  //   setResetCounterObjectNamesData(true);
  //   setResetCounterNamesData(true);
  //   setResetCounterInstanceNamesData(true);
  //   setSelectedClassDisplayName(selectedClass?.displayName);

  //   try {
  //     // Fetch objects based on the classname.
  //     const objects = await instances(selectedClass?.className) //await datasource.getResource('getObjects', { selectedClassName: selectedClass?.className });
  //     setObjectsData(objects || []);

  //     // console.log(objects);
  //     // // Since all objects have same counters, we take one of the object ids and fetch counters.
  //     // if (objects?.length > 0) {
  //     //   getCounters(objects[0]);
  //     // }
  //   } catch (error) {
  //     console.log('getObjects error: ', error);
  //   }
  // }



  // async function getCounters(selectedObject: ObjectData) {
  //   setResetObjectsData(false);
  //   setResetCounterObjectNamesData(false);
  //   setResetCounterNamesData(false);
  //   setResetCounterInstanceNamesData(false);

  //   try {
  //     // Fetch counters by class instances id.
  //     const counters = await datasource.getResource('getCounters', { performanceObjectId: selectedObject?.id });
  //     setCountersData(counters?.rows);

  //     // Set is used to have unique values.
  //     const objectNamesSet = new Set<string>();

  //     counters?.rows.forEach((item: CounterData) => {
  //       objectNamesSet.add(item.objectname);
  //     });

  //     const objectNames = Array.from(objectNamesSet);

  //     // Only counter object names are rendered. Based on this option we filter the other counter types.
  //     setCounterObjectNamesData(objectNames);
  //   } catch (error) {
  //     console.log('getCounter error', error);
  //   }
  // }

  // function onSelectCounterObjectName(objectName: string) {
  //   // When user selected the counter object name, we can filter for -
  //   // - counter name and counter instance name.
  //   const counterNamesSet: Set<string> = new Set();
  //   const counterInstanceNamesSet: Set<string> = new Set();

  //   countersData.forEach((row) => {
  //     if (row.objectname.includes(objectName)) {
  //       counterNamesSet.add(row.countername);
  //       counterInstanceNamesSet.add(row.instancename);
  //     }
  //   });

  //   const uniqueCounterNames: string[] = Array.from(counterNamesSet);
  //   const uniqueCounterInstanceNames: string[] = Array.from(counterInstanceNamesSet);
  //   setSelectedCounterObjectName(objectName);
  //   setCounterNamesData(uniqueCounterNames);
  //   setCounterInstanceNamesData(uniqueCounterInstanceNames);

  //   setResetCounterNamesData(true);
  //   setResetCounterInstanceNamesData(true);
  // }

  // function onSelectCounterName(counterName: string) {
  //   setSelectedCounterName(counterName);
  //   setResetCounterNamesData(false);
  // }

  // function onSelectCounterInstanceName(counterInstanceName: string) {
  //   setSelectedCounterInstanceName(counterInstanceName);
  //   setResetCounterInstanceNamesData(false);
  // }

  // function onGetPerformanceData() {
  //   let selectedObjectsArray: ObjectData[] = Array.from(checkedObjects);

  //   // Value to display in the input, incase user edits after saving dashboard or switches category.
  //   let selectedObjectInputValue = selectedObjectsArray[0]?.displayname;

  //   if (selectedObjectsArray.length > 1) {
  //     selectedObjectInputValue =
  //       selectedObjectsArray[selectedObjectsArray.length - 1].displayname +
  //       ' (+' +
  //       (selectedObjectsArray.length - 1) +
  //       ')';
  //   }

  //   // Empty counter fields.
  //   if (!selectedCounterName || !selectedCounterObjectName || !selectedCounterInstanceName) {
  //     return;
  //   }

  //   // If class instance input is empty - it's interpreted as fetching all class instances.
  //   if (selectedObjectsArray.length === 0) {
  //     selectedObjectsArray = objectsData;
  //   }

  //   // onChange({
  //   //   ...query,
  //   //   toFetch: 'performanceData',
  //   //   performanceCounterName: selectedCounterName,
  //   //   performanceCounterObjectName: selectedCounterObjectName,
  //   //   performanceCounterInstanceName: selectedCounterInstanceName,
  //   //   performanceObjects: selectedObjectsArray,
  //   //   performanceClassDisplayName: selectedClassDisplayName,
  //   //   performanceObjectDisplayName: selectedObjectInputValue,
  //   // });

  //   // onRunQuery();
  // }

  // function onGetGroupPerformanceData() {
  //   // Empty counter fields.
  //   if (!selectedCounterName || !selectedCounterObjectName || !selectedCounterInstanceName || !objectsGroup) {
  //     return;
  //   }

  //   // onChange({
  //   //   ...query,
  //   //   toFetch: 'performanceDataGroup',
  //   //   performanceGroupCounterName: selectedCounterName,
  //   //   performanceGroupCounterObjectName: selectedCounterObjectName,
  //   //   performanceGroupCounterInstanceName: selectedCounterInstanceName,
  //   //   performanceObjects: objectsGroup,
  //   // });

  //   // onRunQuery();
  // }
}
