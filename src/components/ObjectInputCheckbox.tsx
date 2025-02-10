import React from 'react';
import './Styles.css';
import { MonitoringObject } from 'types';

type Props = {
  data: MonitoringObject[] | [];
  placeholder: string;
  defaultValue: string | undefined;
  resetObjectsData: boolean;
  onCheckedObjects: (object: Set<MonitoringObject>) => void;
};

export default function ObjectInputCheckbox({
  data,
  placeholder,
  defaultValue,
  resetObjectsData,
  onCheckedObjects,
}: Props) {
  // const [isFocused, setIsFocused] = useState(false);
  // const [inputValue, setInputValue] = useState(defaultValue);
  // const [filteredData, setFilteredData] = useState<ObjectData[] | []>([]);
  // const [checkedData, setCheckedData] = useState<Set<ObjectData>>(new Set());
  // const containerRef = useRef<HTMLDivElement>(null);

  // const [value, setValue] = useState<SelectableValue<string>>();

  // useEffect(() => {
  //   setFilteredData(data);
  // }, [data]);

  // useEffect(() => {
  //   // Reset input when class data is changed.
  //   if (resetObjectsData) {
  //     setInputValue('');
  //   }
  // }, [resetObjectsData]);

  // useEffect(() => {
  //   // Because user is selecting multiple options, we don't close dropdown on the first click - 
  //   // - instead we handle clicks outside the view here.
  //   function handleClickOutside(event: MouseEvent) {
  //     if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
  //       setIsFocused(false);
  //     }
  //   }

  //   function handleFocusIn(event: FocusEvent) {
  //     if (containerRef.current && containerRef.current.contains(event.target as Node)) {
  //       setIsFocused(true);
  //     }
  //   }

  //   document.addEventListener('mousedown', handleClickOutside);
  //   document.addEventListener('focusin', handleFocusIn);

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //     document.removeEventListener('focusin', handleFocusIn);
  //   };
  // }, []);

  return (
    <>
    </>
    // <Select
    //   value={value}
    //   allowCustomValue
    //   onCreateOption={}
    //   options={filteredData}
    // />
    // <div className="inputContainer" ref={containerRef}>
    //   <Input onChange={onInputChange} value={inputValue} placeholder={placeholder} onFocus={() => setIsFocused(true)} />
    //   {
    //     isFocused === true && filteredData.length > 0 && (
    //     <div className="dropdown">
    //       {filteredData.map((option, index) => (
    //         <div className="dropdownOptionClassInstanceHS" onClick={() => onCheckboxChange(option)} key={index}>
    //           <div className="dropdownOptionClassInstanceNameHS">
    //             <Checkbox
    //               value={checkedData.has(option)}
    //               // Prevents double clicking because parent also has onClick
    //               onClick={(e) => e.stopPropagation()}
    //             />
    //             <p className="dropdownOptionText">{option?.displayname}</p>
    //           </div>

    //           <p className="dropdownOptionSubText">{option?.path}</p>
    //         </div>
    //       ))}
    //     </div>
    //   )}
    // </div>
  );

  // function onCheckboxChange(object: ObjectData) {
  //   setCheckedData((prevCheckedData) => {
  //     const newCheckedData = new Set(prevCheckedData);
  //     // If same class instance is clicked we remove it from checked-list.
  //     if (isChecked(object)) {
  //       newCheckedData.delete(object);
  //     } else {
  //       // Else we add it to the checked objects list.
  //       newCheckedData.add(object);
  //     }

  //     updateInputValue(newCheckedData);
  //     onCheckedObjects(newCheckedData);

  //     return newCheckedData;
  //   });
  // }

  // function isChecked(object: ObjectData): boolean {
  //   return checkedData.has(object);
  // }

  // function updateInputValue(dataSet: Set<ObjectData>) {
  //   // Show in a nice in way the input of how many instances has been selected.
  //   const size = dataSet.size;

  //   if (size === 0) {
  //     setInputValue('');
  //   } else {
  //     const selectedObjects = Array.from(dataSet).map((objectData) => objectData.displayname);

  //     if (size > 1) {
  //       setInputValue(`${selectedObjects[0]} (+${size - 1})`);
  //     } else {
  //       setInputValue(selectedObjects[0]);
  //     }
  //   }
  // }

  // function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
  //   const inputData = e.target.value.toLowerCase();

  //   const filtered = data.filter((option: ObjectData) => {
  //     return option.displayname.toLowerCase().includes(inputData);
  //   });

  //   if (!inputData.trim()) {
  //     setFilteredData(data);
  //   } else {
  //     setFilteredData(filtered);
  //   }

  //   setInputValue(e.target.value);
  // }
}
