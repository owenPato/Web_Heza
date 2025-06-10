import React from 'react';
import Select from 'react-select';

const SelectHeza = ({ options, value, onChange }) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: '#B49C73',
      borderWidth: 2,
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#B49C73',
      },
      borderRadius: 8,
      fontWeight: 600,
      color: '#263D4F',
      padding: '2px 4px',
    }),
    singleValue: (base) => ({
      ...base,
      color: '#263D4F',
      fontWeight: 600,
    }),
    menu: (base) => ({
      ...base,
      border: '1px solid #B49C73',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 99,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#263D4F'
        : state.isFocused
        ? '#f4f4f4'
        : '#fff',
      color: state.isSelected ? '#fff' : '#B49C73',
      fontWeight: 600,
      cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: '#263D4F',
      '&:hover': {
        color: '#B49C73',
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    input: (base) => ({
      ...base,
      color: '#263D4F',
    }),
  };

  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      styles={customStyles}
      isSearchable={false}
    />
  );
};

export default SelectHeza;
