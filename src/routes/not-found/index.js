import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url(new Date());
const onboarded = !!localStorage.getItem('journalbook_onboarded');

const NotFound = () => (
  <div class="wrap center home">
    <h1>Page not found</h1>
    <img src="/assets/images/not-found.svg" alt="" />
    <Link href={onboarded ? today : '/get-started/'} class="button">
      Start writing
    </Link>
  </div>
);

export default NotFound;
