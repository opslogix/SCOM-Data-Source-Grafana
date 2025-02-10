import React, { useState } from 'react';
import { Input } from '@grafana/ui';
import './Styles.css';
import { MonitoringGroup } from 'types';
import { ScomDataSource } from 'datasource';

type Props = {
  onSelect: (group: MonitoringGroup) => void;
  placeholder: string;
  defaultValue: string | undefined;
  datasource: ScomDataSource;
  groupsData: MonitoringGroup[];
};

export default function GroupInput({ onSelect, placeholder, defaultValue, groupsData }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredData, setFilteredData] = useState<MonitoringGroup[] | []>(groupsData);

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

  async function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputData = e.target.value.toLowerCase();
    setInputValue(e.target.value);

    const filteredGroups = groupsData.filter((group) => group.displayName.toLowerCase().includes(inputData));

    setFilteredData(filteredGroups);
  }

  function onOptionSelect(option: MonitoringGroup) {
    setInputValue(option?.displayName);
    setFilteredData([]);
    onSelect(option);
  }
}
