import { h } from 'preact';

const RangePicker = ({ id, value, settings = {}, onChange }) => {
  const hasValue = value !== null && value !== undefined;
  const val = hasValue ? value : settings.default;

  return (
    <div class="u-flex">
      <div class="u-flex-1 mr20">
        <input
          type="range"
          id={id}
          value={val}
          min={settings.min}
          max={settings.max}
          step={settings.step}
          onInput={event => {
            onChange(
              event.target.value === ''
                ? settings.default
                : Number(event.target.value)
            );
          }}
        />
      </div>
      <small class="range-label">{hasValue ? val : 'Not yet set'}</small>
    </div>
  );
};

export { RangePicker };
