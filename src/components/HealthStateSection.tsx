// import { Button, Label, RadioButtonList } from '@grafana/ui';
// import React, { useState } from 'react';
// import ClassInput from './ClassInput';
// import GroupInput from './GroupInput';
// import { MonitoringClass, MonitoringGroup, MyQuery, MonitoringObject } from 'types';
// import { ScomDataSource } from 'datasource';
// import ObjectInputCheckbox from './ObjectInputCheckbox';

// type Props = {
//   query: MyQuery;
//   datasource: ScomDataSource;
//   onChange: (query: MyQuery) => void;
//   onRunQuery: () => void;
//   groupsData: MonitoringGroup[];
// };

// export default function HealthStateSection({ query, datasource, onChange, onRunQuery, groupsData }: Props) {
//   const SINGLE_CLASS = 'singleClass';
//   const GROUP = 'group';

//   const [selectedObjects, setSelectedObjects] = useState<Set<MonitoringObject>>(new Set());
//   const [selectedRadioOption, setSelectedRadioOption] = useState(SINGLE_CLASS);
//   const [objectsData, setObjectsData] = useState<MonitoringObject[]>([]);
//   const [resetObjectsData, setResetObjectsData] = useState(false);

//   return (
//     <div>
//       <RadioButtonList
//         name="healthStateCategory"
//         options={[
//           { label: 'Single Class', value: SINGLE_CLASS },
//           { label: 'Group', value: GROUP },
//         ]}
//         value={selectedRadioOption}
//         onChange={(option) => setSelectedRadioOption(option)}
//         className={'radioGroup'}
//       />

//       {selectedRadioOption === SINGLE_CLASS ? (
//         <div className="rowContainer">
//           <div>
//             <Label>Class</Label>
//             <ClassInput
//               onSelect={onSelectClass}
//               placeholder={'Class'}
//               defaultValue={query?.healthStateClassDisplayName}
//               datasource={datasource}
//               groupsData={groupsData}
//             />
//           </div>

//           <div>
//             <Label>Class instance</Label>
//             <ObjectInputCheckbox
//               data={objectsData}
//               placeholder={'Instance'}
//               defaultValue={query?.healthStateObjectDisplayName}
//               resetObjectsData={resetObjectsData}
//               onCheckedObjects={(object) => setSelectedObjects(object)}
//             />
//           </div>
//           <Button variant="secondary" icon="search" onClick={getHealthStateData}>
//             Search
//           </Button>
//         </div>
//       ) : (
//         <div className="rowContainer">
//           <div>
//             <Label>Group</Label>
//             <GroupInput
//               onSelect={onSelectGroup}
//               placeholder={'Group'}
//               defaultValue={query?.healthStateGroupDisplayName}
//               datasource={datasource}
//               groupsData={groupsData}
//             />
//           </div>

//           <div>
//             <Label>Class</Label>
//             <ClassInput
//               onSelect={getHealthStateDataGroup}
//               placeholder={'Class'}
//               defaultValue={query?.healthStateGroupClassDisplayName}
//               datasource={datasource}
//               groupsData={groupsData}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );

//   async function onSelectClass(selectedClass: MonitoringClass) {
//     // Reset input for objects/class instances.
//     setResetObjectsData(true);

//     try {
//       // Fetch objects for health state. We separate from objects for performance for proper state handling.
//       const objects = await datasource.getResource('getObjectsHealthState', {
//         selectedClassNameHealthState: selectedClass?.className,
//       });

//       setObjectsData(objects?.rows);
//     } catch (error) {
//       console.log('getObjectsHealthState error: ', error);
//     }

//     // Class displayname is saved for when user edits the dashboard after saving or switches category.
//     // Data in onChange is persisten.
//     onChange({
//       ...query,
//       healthStateClassDisplayName: selectedClass?.displayName,
//     });
//   }

//   async function onSelectGroup(group: MonitoringGroup) {
//     // Group id is saved for later when we fetch health state data - where we will need groupId and classId.
//     onChange({
//       ...query,
//       healthStateGroupId: group?.id,
//       healthStateGroupDisplayName: group?.displayName,
//     });
//   }

//   async function getHealthStateDataGroup(selectedClass: MonitoringClass) {
    
//     onChange({
//       ...query,
//       toFetch: 'healthStateGroup',
//       healthStateClassId: selectedClass?.id,
//       healthStateGroupClassDisplayName: selectedClass?.displayName,
//     });

//     onRunQuery();
//   }

//   function getHealthStateData() {
//     // Converting Set to array.
//     let objectsArray = Array.from(selectedObjects);

//     // Savings text to show in input of how many classes have been selected.
//     let selectedObjectInputValue = objectsArray[0]?.displayname;

//     if (objectsArray.length > 1) {
//       selectedObjectInputValue =
//         objectsArray[objectsArray.length - 1].displayname + ' (+' + (objectsArray.length - 1) + ')';
//     }

//     // If class instance input is empty - it's interpreted as fetching all class instances.
//     if (objectsArray.length === 0) {
//       objectsArray = objectsData;
//     }

//     if(objectsArray.length === 0){
//       return;
//     }

//     const ids = objectsArray.map((obj) => obj.id)

//     // Fetches healthstate data and shows it in Grafana dashboard.
//     onChange({
//       ...query,
//       type: 'state',
//       // healthStateObjects: objectsArray,
//       // healthStateObjectIds: ids,
//       // healthStateObjectDisplayName: selectedObjectInputValue,
//     });

//     onRunQuery();
//   }
// }
