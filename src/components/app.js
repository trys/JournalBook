import { h, Component } from 'preact';
import { Router } from 'preact-router';
import idb from 'idb';
import { sendBeacon } from '../utils/beacon';
import Header from './Header';
import { DB } from '../utils/db';

import Home from '../routes/home';
import Day from '../routes/day';
import Month from '../routes/months';
import Year from '../routes/year';
import Settings from '../routes/settings';
import GetStarted from '../routes/get-started';
import Highlights from '../routes/highlights';
import About from '../routes/about';
import NotFound from '../routes/not-found';
import { fudgeDates, ymd } from '../utils/date';
import { getDefaultTheme } from '../utils/theme';

const tables = [
  () => {},
  db => {
    db.createObjectStore('questions');
  },
  db => {
    db.createObjectStore('entries');
  },
  db => {
    db.createObjectStore('highlights');
  },
];

const isOnboarded = () => !!localStorage.getItem('journalbook_onboarded');
const isMigrated = () => !!localStorage.getItem('journalbook_dates_migrated');

export default class App extends Component {
  state = {
    onboarded: isOnboarded(),
    theme: getDefaultTheme(),
  };

  componentDidMount() {
    if (localStorage.getItem('journalbook_theme') === null) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
        const theme = e.matches ? 'dark' : '';
        document.querySelector('#app').dataset.theme = theme;
        this.setState({ theme });
      });
    }

    const version = tables.length - 1;
    idb.open('entries-store', version, upgradeDB => {
      for (let index = upgradeDB.oldVersion + 1; index <= version; index++) {
        tables[index] && tables[index](upgradeDB);
      }
    });

    if (!isMigrated()) {
      const db = new DB();
      const table = 'entries';
      // Get the existing keys
      db.keys(table).then(keys => {
        if (!keys.length) {
          localStorage.setItem('journalbook_dates_migrated', true);
          return;
        }

        Promise.all(
          keys.map(key => {
            // Get each item, parse the date and create a new key
            return db.get(table, key).then(value => {
              const oldKey = key.split('_');
              const { year, month, day } = fudgeDates(oldKey[0]);
              const newKey = ymd(new Date(year, month, day)) + '_' + oldKey[1];

              // Set the new entry & delete the old entry
              return db
                .set(table, newKey, value)
                .then(() => db.delete(table, key));
            });
          })
        ).then(() => {
          // Flag it up and reload
          localStorage.setItem('journalbook_dates_migrated', true);
          window.location.reload();
        });
      });
    }
  }

  handleRoute = () => {
    sendBeacon('hit');

    if (this.state.onboarded !== isOnboarded()) {
      this.setState({
        onboarded: isOnboarded(),
      });
    }
  };

  render({}, { onboarded, theme = '' }) {
    return (
      <div id="app" data-theme={theme}>
        <Header onboarded={onboarded} />
        <Router onChange={this.handleRoute}>
          <Home path="/" />
          <GetStarted path="/get-started/" />
          <Settings path="/settings/" />
          <About path="/about/" />
          <Highlights path="/highlights/" />
          <Day path="/:year/:month/:day" />
          <Month path="/:year/:month" />
          <Year path="/:year" />
          <NotFound default />
        </Router>
      </div>
    );
  }
}
