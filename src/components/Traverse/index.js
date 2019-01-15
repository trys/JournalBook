import { h } from 'preact';
import { Link } from 'preact-router/match';

const Traverse = ({
  title = '',
  lastLink = '',
  nextLink = '',
  disableNext = false,
  actions = null,
  className = ''
}) => {
  return (
    <header class={`traverse ${className}`}>
      <h1>{title}</h1>
      {actions}
      {lastLink ? (
        <Link class="traverse__arrow" href={lastLink}>
          <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
            <title>Previous</title>
            <path
              d="M2.4 7l5.3-5.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-6 6c-.4.4-.4 1 0 1.4l6 6c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L2.4 7z"
              fill="currentColor"
              fill-rule="nonzero"
            />
          </svg>
        </Link>
      ) : (
        null
      )}
      {lastLink ? (
        <Link class="traverse__arrow" disabled={disableNext} href={nextLink}>
          <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
            <title>Next</title>
            <path
              d="M7.7 6.3l-6-6C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L5.6 7 .3 12.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3l6-6c.4-.4.4-1 0-1.4z"
              fill="currentColor"
              fill-rule="nonzero"
            />
          </svg>
        </Link>
      ) : (
        null
      )}
    </header>
  );
};

export default Traverse;
