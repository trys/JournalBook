import { h } from 'preact';

const Toggle = ({ on, onToggle, label = '' }) => (
  <label class="toggle">
    <input type="checkbox" checked={on} onChange={onToggle} />
    <i />
    {label && <span>{label}</span>}
  </label>
);

export { Toggle };
