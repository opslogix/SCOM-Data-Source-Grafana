import React, { useState } from 'react';
import { Input } from '@grafana/ui';
import './Styles.css';
import { MonitoringClass, MonitoringGroup } from 'types';
import { ScomDataSource } from 'datasource';

type Props = {
  onSelect: (selectedClass: MonitoringClass) => void;
  placeholder: string;
  defaultValue: string | undefined;
  datasource: ScomDataSource;
  groupsData: MonitoringGroup[];
};

export default function ClassInput({ onSelect, placeholder, defaultValue, datasource, groupsData }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredData, setFilteredData] = useState<MonitoringClass[] | []>([]);
  
  async function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputData = e.target.value.toLowerCase();
    setInputValue(e.target.value);

    try {
      // Get all classes which also includes groups.
      const classes = await datasource.getResource('getClasses', { classQuery: inputData });

      // Filter out groups from classes data.
      const classesWithNoGroups = classes?.filter((classData: MonitoringClass) => {
        return !groupsData.some((group: MonitoringGroup) => group.id === classData.id);
      });

      setFilteredData(classesWithNoGroups);
    } catch (error) {
      console.log("classes data error: ", error)
    }
  }

  function onOptionSelect(option: MonitoringClass) {
    setInputValue(option?.displayName);
    setFilteredData([]);
    onSelect(option);
  }

  return (
    <div className="inputContainer">
      <Input
        onChange={onInputChange}
        value={inputValue}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setTimeout(() => {
            setIsFocused(false);
          }, 300);
        }}
      />

      {isFocused === true && filteredData.length > 0 && (
        <div className="dropdown">
          {filteredData.map((option, index) => (
            <div key={index} onClick={() => onOptionSelect(option)}>
              <p className="dropdownOption">{option?.displayName}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

}
