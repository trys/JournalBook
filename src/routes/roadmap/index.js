import { h } from 'preact';

const Roadmap = () => (
  <div>
    <h1>Roadmap</h1>
    {process.env.PREACT_APP_DB_VERSION}
  </div>
);

export default Roadmap;
