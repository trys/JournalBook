import { h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style';

const Header = () => (
  <header class={style.header}>
    <Link activeClassName={style.active} href="/">
      J
    </Link>
    <Link activeClassName={style.active} href="/questions/">
      Questions
    </Link>
  </header>
);

export default Header;
