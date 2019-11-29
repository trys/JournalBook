import { h } from 'preact';

const NumberPicker = ({ id, value, settings = {}, onChange }) => (
  <div>
    <input
      type="number"
      id={id}
      value={value !== undefined ? value : settings.default}
      min={settings.min}
      max={settings.max}
      step={settings.step}
      onChange={event => {
        onChange(
          event.target.value === ''
            ? settings.default
            : Number(event.target.value)
        );
      }}
    />
  </div>
);

export { NumberPicker };
