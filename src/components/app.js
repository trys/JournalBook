import { h, Component } from 'preact';
import { Router } from 'preact-router';
import idb from 'idb';

import Header from './header';

// Code-splitting is automated for routes
import Home from '../routes/home';
import Day from '../routes/day';
import Settings from '../routes/settings';
import Roadmap from '../routes/roadmap';

const tables = [
  () => {},
  db => {
    db.createObjectStore('questions');
  },
  db => {
    db.createObjectStore('entries');
  }
];

export default class App extends Component {
  componentDidMount() {
    const key = Number(process.env.PREACT_APP_DB_VERSION);
    const dbPromise = idb.open('entries-store', key, upgradeDB => {
      for (let index = upgradeDB.oldVersion + 1; index <= key; index++) {
        tables[index] && tables[index](upgradeDB);
      }
    });
  }

  render() {
    return (
      <div id="app">
        <Header />
        <Router onChange={this.handleRoute}>
          <Home path="/" />
          <Roadmap path="/roadmap/" />
          <Settings path="/settings/" />
          <Day path="/:year/:month/:day" />
        </Router>
      </div>
    );
  }
}
