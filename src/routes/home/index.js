import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url(new Date());

const Home = () => (
  <div class="wrap center">
    <h1>Welcome to your Journal</h1>
    <br />
    <Link href={today} class="button">
      Start writing
    </Link>
  </div>
);

export default Home;
