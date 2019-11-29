import { h } from 'preact';

const StarPicker = ({ id, value, onChange }) => (
  <div class="stars">
    {[1, 2, 3, 4, 5].map(v => (
      <div>
        <input
          type="checkbox"
          value={v}
          id={`${id}_star_${v}`}
          class="screen-reader-only"
          checked={value && v <= value}
          onChange={() => onChange(v)}
        />
        <label for={`${id}_star_${v}`} aria-label={`${v} stars`}>
          <svg width="28" height="27" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18 9.2l9 1.4-6.5 6.4 1.5 9-8-4.3L6 26l1.5-9L1 10.6l9-1.4L14 1z"
              fill="#4653AC"
              stroke="#4653AC"
              stroke-width="2"
              fill-rule="evenodd"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </label>
      </div>
    ))}
  </div>
);

export { StarPicker };
