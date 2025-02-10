import React, { useEffect, useState } from 'react';
import { Input } from '@grafana/ui';
import './Styles.css';

type Props = {
  data: string[] | [];
  onSelectCounter: (objectName: string) => void;
  placeholder: string;
  defaultValue: string | undefined;
  resetCountersData: boolean;
};

export default function CounterInput({ data, onSelectCounter, placeholder, defaultValue, resetCountersData }: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState(defaultValue);
  const [filteredData, setFilteredData] = useState<string[] | []>([]);

  useEffect(() => {
    console.log(data);
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    if (resetCountersData) {
      setInputValue('');
    }
  }, [resetCountersData]);

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
              <p className="dropdownOption">{option}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputData = e.target.value.toLowerCase();

    const filtered = data.filter((option: string) => {
      return option.toLowerCase().includes(inputData);
    });

    if (!inputData.trim()) {
      setFilteredData(data);
    } else {
      setFilteredData(filtered);
    }

    setInputValue(e.target.value);
  }

  function onOptionSelect(option: string) {
    setInputValue(option);
    setFilteredData([]);
    onSelectCounter(option);
  }
}
