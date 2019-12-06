import { h } from 'preact';
import { Link } from 'preact-router/match';

const NotFound = () => (
  <div class="wrap wrap--thin lift-children">
    <h1 class="mb20">About JournalBook</h1>
    <div>
      <p>JournalBook is a private, offline-first personal journal.</p>
      <p>
        A journal is a personal thing, so JournalBook strives to be the most
        private online journal out there.
      </p>
      <p>
        Your notes are <strong>only</strong> stored on your device, they're
        never even sent to a server. You don't even need to sign-in to use it!
        It works offline, so you can reflect upon your day on the slow train
        journey home.
      </p>
      <p>
        This does mean there's <strong>no online backup</strong> of your entries
        should you lose your phone/computer or anything go wrong on our side.
        However, you can import and export your data from{' '}
        <Link href="/settings/">the settings area</Link> and we'd encourage you
        to do that from time to time!.
      </p>
      <p>
        As well as traditional written entries, you can use JournalBook to track
        sleep, medicines, anxiety, exercise, habits, or just about anything else
        you fancy.
      </p>
      <p>
        It's quick and is developed{' '}
        <a href="https://github.com/trys/JournalBook">in the open</a>. You can
        even add it to your homescreen as an app.
      </p>
      <p>
        If you do have any issues, or want to suggest a new feature, please{' '}
        <a href="https://twitter.com/trysmudford/">tweet me</a> or raise an{' '}
        <a href="https://github.com/trys/JournalBook/">issue on GitHub</a>.
      </p>
      <p className="mb20">
        <small>
          Created by <a href="https://trysmudford.com">Trys</a>
        </small>
      </p>
    </div>
  </div>
);

export default NotFound;
