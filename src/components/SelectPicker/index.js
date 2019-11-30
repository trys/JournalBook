import { h } from 'preact';

const SelectPicker = ({ id, value, options = [], onChange }) => (
  <select id={id} value={value} onChange={e => onChange(e.target.value)}>
    {options.map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

export { SelectPicker };
