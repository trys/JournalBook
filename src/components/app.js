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
import Auth from '../routes/auth';
import AuthCallback from '../routes/auth-callback';
import NotFound from '../routes/not-found';
import { getDefaultTheme, prefersAnimation } from '../utils/theme';
import { connect } from 'unistore/preact';
import { actions } from '../store/actions';
import { DBError } from './DBError';

const isOnboarded = () => !!localStorage.getItem('journalbook_onboarded');

class App extends Component {
  state = {
    onboarded: isOnboarded(),
    dbError: false,
  };

  async componentDidMount() {
    try {
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
              theme: localStorage.getItem('journalbook_theme') || '',
              animation: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'off'
                : '',
            });
        }
      });

      await dbPromise;
      await this.props.boot(dbPromise);

      if (this.props.settings) {
        if (this.props.settings.theme === '') {
          window.matchMedia('(prefers-color-scheme: dark)').addListener(e => {
            this.setState({ theme: e.matches ? 'dark' : '' });
          });
        }

        if (this.props.settings.theme === '') {
          window
            .matchMedia('(prefers-reduced-motion: reduce)')
            .addListener(e => {
              this.setState({ animation: e.matches ? 'off' : '' });
            });
        }
      }
    } catch (e) {
      this.setState({ dbError: true });
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

  render({ settings = {}, db }, { onboarded, dbError }) {
    const theme = settings.theme || getDefaultTheme(settings);
    const animation = settings.animation || prefersAnimation(settings);

    return (
      <div
        id="app"
        data-theme={theme}
        data-reduce-motion={animation === 'off' ? 'true' : 'false'}
      >
        <Header onboarded={onboarded} />
        {db && (
          <Router onChange={this.handleRoute}>
            <Home path="/" />
            <GetStarted path="/get-started/" />
            <Settings path="/settings/" />
            <About path="/about/" />
            <Auth path="/auth/:provider" />
            <AuthCallback path="/auth/callback/:provider" />
            <Highlights path="/highlights/" />
            <Day path="/:year/:month/:day" />
            <Month path="/:year/:month" />
            <Year path="/:year" />
            <NotFound default />
          </Router>
        )}
        {dbError && (
          <DBError
            toggle={() =>
              this.setState({
                dbError: false,
              })
            }
          />
        )}
      </div>
    );
  }
}

export default connect(
  'settings, db',
  actions
)(App);
