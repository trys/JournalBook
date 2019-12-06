import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';
import LinkPanel from '../../components/LinkPanel';

const today = url();
const onboarded = !!localStorage.getItem('journalbook_onboarded');

const Home = () =>
  onboarded ? (
    <div class="wrap wrap--thin center home lift-children">
      <Link href={today}>
        <h1>Welcome back!</h1>
        <img src="/assets/images/study.svg" class="home-image" alt="" />
        <span class="button">Start writing</span>
      </Link>

      <aside class="link-panels">
        <LinkPanel
          href="/stats/"
          title="Statistics &amp; Reporting"
          variation="peach"
        >
          <svg width="30" height="28" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M19 21.6L12.3.9a1.4 1.4 0 00-2.6 0L5.8 12.3H1.4a1.4 1.4 0 100 2.7h5.4c.6 0 1.1-.4 1.3-1L11 5.8l6.9 20.6a1.4 1.4 0 002.6 0L24.2 15h4.4a1.4 1.4 0 100-2.7h-5.4c-.6 0-1.1.3-1.3 1L19 21.5z"
              fill="#F2F3F8"
              fill-rule="nonzero"
            />
          </svg>
        </LinkPanel>
        <LinkPanel href="/settings/" title="Backup" variation="purple">
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M28.5 18c.8 0 1.5.7 1.5 1.5v6c0 2.5-2 4.5-4.5 4.5h-21C2 30 0 28 0 25.5v-6a1.5 1.5 0 013 0v6c0 .8.7 1.5 1.5 1.5h21c.8 0 1.5-.7 1.5-1.5v-6c0-.8.7-1.5 1.5-1.5zM15 0c.8 0 1.5.7 1.5 1.5v14.4l5-5c.5-.5 1.4-.5 2 0 .6.6.6 1.6 0 2.2l-7.4 7.5a1.5 1.5 0 01-.9.4H15a1.5 1.5 0 01-1-.4L6.3 13a1.5 1.5 0 012.2-2.2l4.9 5V1.5c0-.8.6-1.4 1.4-1.5z"
              fill="#F2F3F8"
              fill-rule="nonzero"
            />
          </svg>
        </LinkPanel>
        <LinkPanel href="/about/" title="About JB" variation="rose">
          <svg width="30" height="30" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15 0a15 15 0 110 30 15 15 0 010-30zm0 2.7a12.3 12.3 0 100 24.6 12.3 12.3 0 000-24.6zM14 21a1.4 1.4 0 112 1.9 1.4 1.4 0 01-2-2zM9.7 10.5a5.5 5.5 0 0110.6 1.8c0 1.7-1 3.1-2.6 4.2-.9.6-1.8 1-2.4 1.2a1.4 1.4 0 01-.8-2.6h.1l.4-.2 1.2-.7c1-.6 1.4-1.3 1.4-2a2.7 2.7 0 00-5.3-.8v.1a1.4 1.4 0 01-2.6-1z"
              fill="#F2F3F8"
              fill-rule="nonzero"
            />
          </svg>
        </LinkPanel>
      </aside>
    </div>
  ) : (
    <div class="wrap wrap--thin center home lift-children">
      <Link href="/get-started/">
        <h1>Welcome to JournalBook</h1>
        <img src="/assets/images/study.svg" class="home-image" alt="" />
        <span class="button">Get started</span>
      </Link>
      <div className="mt20 mb20">
        <h2>What's JournalBook?</h2>
        <p>JournalBook is a private, offline-first personal journal.</p>
        <p>
          Your notes are <strong>only</strong> stored on your device, they're
          never even sent to a server. You don't even need to sign-in to use it!
          It works offline, so you can reflect upon your day on the slow train
          journey home.
        </p>
        <p>
          It's quick, has right to left support, and is developed{' '}
          <a href="https://github.com/trys/JournalBook">in the open</a>. You can
          even add it to your homescreen as an app.
        </p>
      </div>
      <p>
        <small>
          Created by <a href="https://trysmudford.com">Trys</a>
        </small>
      </p>
    </div>
  );

export default Home;
