import { h } from 'preact';
import { Link } from 'preact-router/match';

const LinkPanel = ({
  href = '/',
  title = '',
  children = null,
  variation = '',
}) => (
  <Link href={href} class={`link-panel link-panel--${variation}`}>
    {children}
    <strong>{title}</strong>
  </Link>
);

export default LinkPanel;
