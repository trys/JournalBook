import { Link } from 'preact-router/match';

/**
 * Returns  0 if dates are equal
 * Returns  1 if a > b
 * Returns -1 if b > a
 */
export const compare = (a, b) => {
  a = new Date(a);
  b = new Date(b);

  if (a > b) {
    return 1;
  } else if (b > a) {
    return -1;
  }

  return 0;
};

export const double = n => (n < 9 ? `0${n}` : n);

export const url = (date = new Date(), suffix = '') =>
  `/${date.getFullYear()}/${double(date.getMonth() + 1)}/${double(
    date.getDate()
  )}/${suffix ? `${suffix}/` : ''}`;

export const pad = n => (n < 10 ? '0' : '') + n;

export const getOffsetToMonday = (d = new Date()) => {
  const day = d.getDay();
  return day - (!day ? -6 : 1);
};

/**
 * @link https://www.devcurry.com/2011/08/javascript-find-day-of-year.html
 */
export const getOffsetToYear = () => {
  const timestmp = new Date().setFullYear(new Date().getFullYear(), 0, 1);
  const yearFirstDay = Math.floor(timestmp / 86400000);
  const today = Math.ceil(new Date().getTime() / 86400000);
  return today - yearFirstDay;
};

export const ymd = (date = new Date()) => {
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${y}${m}${d}`; // Example: 20190103
};

export const ordinal = n => {
  switch (n) {
    case 1:
    case 21:
    case 31:
      return n + 'st';
    case 2:
    case 22:
      return n + 'nd';
    case 3:
    case 23:
      return n + 'rd';
    default:
      return n + 'th';
  }
};

export const days = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const parse = date => {
  const year = Number(date.substring(0, 4));
  const month = Number(date.substring(4, 6)) - 1;
  const day = Number(date.substring(6, 8));
  return new Date(year, month, day);
};

export const parseToUrl = (date, suffix = '') => {
  return url(parse(date), suffix);
};

export const format = date => {
  return (
    <span>
      {days[date.getDay()]} {ordinal(date.getDate())}{' '}
      <Link href={`/${date.getFullYear()}/${pad(date.getMonth() + 1)}`}>
        {months[date.getMonth()]}
      </Link>{' '}
      <Link href={`/${date.getFullYear()}`}>{date.getFullYear()}</Link>
    </span>
  );
};

export const shortDate = date => {
  const dayName = days[date.getDay()].substring(0, 3);
  return `${dayName} ${ordinal(date.getDate())} ${months[date.getMonth()]}`;
};

export const filledArray = (v = 0, count = 12) => new Array(count).fill(v);

/**
 * I painted myself into a corner with bad dates :(
 * This little beaut breaks the awful date string apart and puts it back
 * together again with a bit of string hackery. Sorry to anyone who sees this.
 *
 * @param  date   string  201801
 * @return object { year, month, day }
 */
export const fudgeDates = date => {
  const monthAndDay = date.substring(4);
  const length = monthAndDay.length;
  let middle;

  if (length === 4 || length === 2) {
    middle = length / 2;
  } else {
    if (monthAndDay.indexOf('10') === 0 || monthAndDay.indexOf('11') === 0) {
      middle = 2;
    } else {
      middle = 1;
    }
  }

  const year = Number(date.substring(0, 4));
  const month = Number(monthAndDay.substring(0, middle));
  const day = Number(monthAndDay.substring(middle));

  return { year, month, day };
};

export const sortDates = (a, b) => {
  if (a < b) {
    return -1;
  } else if (a === b) {
    return 0;
  } else {
    return 1;
  }
};
