import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url(new Date());
const onboarded = !!localStorage.getItem('journalbook_onboarded');

const Home = () =>
  onboarded ? (
    <div class="wrap center home">
      <h1>This is your JournalBook</h1>
      <Link href={today}>
        <img src="/assets/images/study.svg" class="home-image" alt="" />
        <span class="button">Start writing</span>
      </Link>
    </div>
  ) : (
    <div class="wrap wrap--thin center home">
      <h1>Welcome to JournalBook</h1>
      <Link href="/get-started/">
        <img src="/assets/images/study.svg" class="home-image" alt="" />
        <span class="button">Start writing</span>
      </Link>
      <br />
      <h2>What's JournalBook?</h2>
      <p>JournalBook is a private, offline-first personal journal.</p>
      <p>
        Your notes are <strong>only</strong> stored on your device, they're
        never even sent to a server. You don't even need to sign-in to use it!
        It's works offline, so you can reflect upon your day on the slow train
        journey home.
      </p>
      <p>
        It's quick, lightweight, and developed{' '}
        <a href="https://github.com/trys/JournalBook">in the open</a>. You can
        even add it to your homescreen as an app.
      </p>
      <br />
      <p>
        <small>
          Created by <a href="https://trysmudford.com">Trys</a>
        </small>
      </p>
    </div>
  );

export default Home;
