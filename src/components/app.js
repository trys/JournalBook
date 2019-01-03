import { h, Component } from 'preact';
import { Router } from 'preact-router';
import idb from 'idb';
import { sendBeacon } from '../utils/beacon';
import Header from './Header';

import Home from '../routes/home';
import Day from '../routes/day';
import Year from '../routes/year';
import Settings from '../routes/settings';
import GetStarted from '../routes/get-started';
import NotFound from '../routes/not-found';

const tables = [
  () => {},
  db => {
    db.createObjectStore('questions');
  },
  db => {
    db.createObjectStore('entries');
  },
];

const isOnboarded = () => !!localStorage.getItem('journalbook_onboarded');

export default class App extends Component {
  state = {
    onboarded: isOnboarded(),
  };

  componentDidMount() {
    const key = Number(process.env.PREACT_APP_DB_VERSION);
    idb.open('entries-store', key, upgradeDB => {
      for (let index = upgradeDB.oldVersion + 1; index <= key; index++) {
        tables[index] && tables[index](upgradeDB);
      }
    });
  }

  handleRoute = () => {
    sendBeacon('hit');

    if (this.state.onboarded !== isOnboarded()) {
      this.setState({
        onboarded: isOnboarded(),
      });
    }
  };

  render({}, { onboarded }) {
    return (
      <div id="app">
        <Header onboarded={onboarded} />
        <Router onChange={this.handleRoute}>
          <Home path="/" />
          <GetStarted path="/get-started/" />
          <Settings path="/settings/" />
          <Day path="/:year/:month/:day" />
          <Year path="/:year" />
          <NotFound default />
        </Router>
      </div>
    );
  }
}
