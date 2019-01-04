import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url();
const onboarded = !!localStorage.getItem('journalbook_onboarded');

const NotFound = () => (
  <div class="wrap center home lift-children">
    <h1>Page not found</h1>
    <Link href={onboarded ? today : '/get-started/'}>
      <img src="/assets/images/not-found.svg" class="home-image" alt="" />
      <span class="button">Start writing</span>
    </Link>
  </div>
);

export default NotFound;
