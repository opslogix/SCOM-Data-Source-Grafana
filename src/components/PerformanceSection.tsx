import React, { useState } from 'react';
import { AsyncSelect, RadioButtonList, Select } from '@grafana/ui';
// import ClassInput from './ClassInput';
// import CounterInput from './CounterInput';
// import GroupInput from './GroupInput';
// import ObjectInputCheckbox from './ObjectInputCheckbox';
import { useDs } from './providers/ds.provider';
import { MonitoringClass, MonitoringGroup, MonitoringObject } from 'types';

// type Props = {
//   query: MyQuery;
//   datasource: ScomDataSource;
//   onChange: (query: MyQuery) => void;
//   onRunQuery: () => void;
//   groupsData: GroupData[];
// };

export default function PerformanceSection() {

  const { getClasses, getMonitoringObjects } = useDs();
  // const [selectedClass, onSelectClass] = useState<MonitoringClass | undefined>();
  // const [selectedInstance, setSelectedInstance] = useState<MonitoringObject | undefined>();

  const SINGLE_CLASS = 'singleClass';
  const GROUP = 'group';
  const [selectedRadioOption, setSelectedRadioOption] = useState(SINGLE_CLASS);

  const [selectedClass, setSelectedClass] = useState<MonitoringClass | undefined | null>();
  const [selectedInstance, setSelectedInstance] = useState<MonitoringObject | undefined | null>();
  const [classInstances, setClassInstances] = useState<MonitoringObject[]>([]);
  // const [objectsData, setObjectsData] = useState<ObjectData[]>([]);
  // const [countersData, setCountersData] = useState<CounterData[]>([]);
  // const [counterObjectNamesData, setCounterObjectNamesData] = useState<string[]>([]);
  // const [counterNamesData, setCounterNamesData] = useState<string[]>([]);
  // const [counterInstanceNamesData, setCounterInstanceNamesData] = useState<string[]>([]);

  // /******** Reset data ********/
  // // We use this approach (useState + useEffect) to avoid delays in displaying values.
  // const [resetObjectsData, setResetObjectsData] = useState(false);
  // const [resetCounterObjectNamesData, setResetCounterObjectNamesData] = useState(false);
  // const [resetCounterNamesData, setResetCounterNamesData] = useState(false);
  // const [resetCounterInstanceNamesData, setResetCounterInstanceNamesData] = useState(false);

  /******** Selected values ********/
  // const [selectedCounterName, setSelectedCounterName] = useState('');
  // const [selectedCounterObjectName, setSelectedCounterObjectName] = useState('');
  // const [selectedCounterInstanceName, setSelectedCounterInstanceName] = useState('');
  // const [checkedObjects, setCheckedObjects] = useState<Set<ObjectData>>(new Set());
  // const [selectedClassDisplayName, setSelectedClassDisplayName] = useState('');
  // const [selectedGroup, setSelectedGroup] = useState<GroupData>();
  // const [objectsGroup, setObjectsGroup] = useState();

  const onClassSelect = async (v?: MonitoringClass | undefined) => {
    if (v === undefined) {
      return;
    }

    setSelectedClass(v);
    setSelectedInstance(null);
    setClassInstances(await getMonitoringObjects(v.className));
  }

  const onInstanceSelect = (v?: MonitoringObject | undefined) => {
    if (v === undefined) {
      return;
    }
    setSelectedInstance(v);
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
              aria-label='Select class'
              defaultOptions={true}
              value={selectedClass}
              getOptionLabel={(v) => v.displayName}
              loadOptions={loadClassOptions}
              onChange={(v) => onClassSelect(v as MonitoringClass)}
              cacheOptions={true}
            />
            <Select<MonitoringObject>
              getOptionLabel={(v) => v.displayName}
              value={selectedInstance}
              options={classInstances}
              onChange={(v) => onInstanceSelect(v as MonitoringObject)}
            />
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
