import React, { useEffect, useState } from 'react';
import { Input } from '@grafana/ui';
import './Styles.css';
import { MonitoringObject } from 'types';

type Props = {
  data: MonitoringObject[] | [];
  onSelect: (selectedObject: MonitoringObject) => void;
  placeholder: string;
  defaultValue: string | undefined;
  resetObjectsData: boolean;
};

export default function ObjectInput({ data, onSelect, placeholder, defaultValue, resetObjectsData }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredData, setFilteredData] = useState<MonitoringObject[] | []>([]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    // When new class is selected the object input is reset.
    if (resetObjectsData) {
      setInputValue('');
    }
  }, [resetObjectsData]);

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
            <div key={index} onClick={() => onOptionSelect(option)} className="dropdownOptionClassInstanceHS">
              <p className="dropdownOptionText">{option?.displayName}</p>
              <p className="dropdownOptionSubText">{option?.path}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputData = e.target.value.toLowerCase();
    
    const filtered = data.filter((option: MonitoringObject) => {
      return option.displayName.toLowerCase().includes(inputData);
    });

    if (!inputData.trim()) {
      setFilteredData(data);
    } else {
      setFilteredData(filtered);
    }

    setInputValue(e.target.value);
  }

  function onOptionSelect(option: MonitoringObject) {
    setInputValue(option?.displayName);
    setFilteredData([]);
    onSelect(option);
  }
}
