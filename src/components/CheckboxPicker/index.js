import { h } from 'preact';

const CheckboxPicker = ({
  id,
  type = 'checkbox',
  value,
  options = [],
  onChange,
}) => (
  <div>
    {options.map(option => (
      <div class="c-checkbox" key={option}>
        <input
          id={`${id}_${option}`}
          class="screen-reader-only"
          type={type}
          checked={value.includes(option)}
          onChange={() => onChange(option)}
        />
        <label for={`${id}_${option}`}>{option}</label>
      </div>
    ))}
  </div>
);

export { CheckboxPicker };
