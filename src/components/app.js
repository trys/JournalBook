import { h, Component } from 'preact';
import { Router } from 'preact-router';
import { openDb } from 'idb';
import { sendBeacon } from '../utils/beacon';
import Header from './Header';

import Home from '../routes/home';
import Day from '../routes/day';
import Month from '../routes/months';
import Year from '../routes/year';
import Settings from '../routes/settings';
import GetStarted from '../routes/get-started';
import Highlights from '../routes/highlights';
import About from '../routes/about';
import NotFound from '../routes/not-found';
import { getDefaultTheme } from '../utils/theme';
import { connect } from 'unistore/preact';
import { actions } from '../store/actions';

const userTheme = localStorage.getItem('journalbook_theme');
const isOnboarded = () => !!localStorage.getItem('journalbook_onboarded');
const isMigrated = () => !!localStorage.getItem('journalbook_dates_migrated');

class App extends Component {
  state = {
    onboarded: isOnboarded(),
  };

  async componentDidMount() {
    if (userTheme === null) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
        const theme = e.matches ? 'dark' : '';
        document.querySelector('#app').dataset.theme = theme;
        this.setState({ theme });
      });
    }

    const version = 4;
    const dbPromise = openDb('entries-store', version, udb => {
      switch (udb.oldVersion) {
        case 0:
          udb.createObjectStore('questions');
        case 1:
          udb.createObjectStore('entries');
        case 2:
          udb.createObjectStore('highlights');
        case 3:
          udb.createObjectStore('settings', {
            theme: userTheme || '',
          });
      }
    });

    await dbPromise;
    await this.props.boot(dbPromise);
  }

  handleRoute = () => {
    sendBeacon('hit');

    if (this.state.onboarded !== isOnboarded()) {
      this.setState({
        onboarded: isOnboarded(),
      });
    }
  };

  render({ settings = {} }, { onboarded }) {
    const theme = settings.theme || getDefaultTheme(settings);

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

export default connect(
  'settings',
  actions
)(App);
