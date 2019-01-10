import { h } from 'preact';

const DBError = ({ toggle = () => null }) => (
  <aside class="db-error">
    <div class="db-error__content">
      <p>Sorry! There was a setting up the local data store.</p>
      <p>This can happen in Firefox, particularly in private windows.</p>
      <button onClick={() => location.reload()} class="button">
        Try refreshing
      </button>
    </div>
    <button
      type="button"
      onClick={toggle}
      aria-label="Dismiss"
      class="db-error__dismiss"
    />
  </aside>
);

export { DBError };
