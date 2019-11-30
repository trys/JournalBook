import { h } from 'preact';

const TogglePicker = ({ id, value, onChange }) => {
  const checked = value.includes(true);
  return (
    <div class="c-toggle">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={() => onChange([!checked])}
      />
      <label for={id}>{''}</label>
    </div>
  );
};

export { TogglePicker };
