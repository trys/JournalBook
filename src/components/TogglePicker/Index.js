import { h } from 'preact';

const TogglePicker = ({ id, value, onChange }) => {
  const checked = value.includes(true);
  return (
    <div class="c-checkbox">
      <input
        id={id}
        type="checkbox"
        class="screen-reader-only"
        checked={checked}
        onChange={() => onChange([!checked].filter(Boolean))}
      />
      <label for={id}>{''}</label>
    </div>
  );
};

export { TogglePicker };
