import { h } from 'preact';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';

const today = url(new Date());

const Home = () => (
  <div>
    <Link href={today}>Today</Link>
  </div>
);

export default Home;
