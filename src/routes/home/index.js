import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url(new Date());
const onboarded = !!localStorage.getItem('journalbook_onboarded');

const Home = () =>
  onboarded ? (
    <div class="wrap center home">
      <h1>This is your JournalBook</h1>
      <img src="/assets/images/study.svg" alt="" />
      <Link href={today} class="button">
        Start writing
      </Link>
    </div>
  ) : (
    <div class="wrap wrap--thin center home">
      <h1>Welcome to JournalBook</h1>
      <img src="/assets/images/study.svg" alt="" />
      <Link href="/get-started/" class="button">
        Start writing
      </Link>
      <br />
      <h2>What's JournalBook?</h2>
      <p>JournalBook is a private, offline-first personal journal.</p>
      <p>
        Your notes are <strong>only</strong> stored on your device, they're
        never sent to any server or tracking facility. It's designed to work
        offline, so you can reflect on your day whilst on the train journey
        home.
      </p>
      <p>
        It's quick, lightweight, and developed{' '}
        <a href="https://github.com/trys/JournalBook">in the open</a>. You can
        even add it to your homescreen as an app.
      </p>
      <p />
    </div>
  );

export default Home;
