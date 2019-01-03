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

export const url = (date = new Date()) =>
  `/${date.getFullYear()}/${double(date.getMonth() + 1)}/${double(
    date.getDate()
  )}/`;

export const ymd = (date = new Date()) =>
  `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;

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

export const format = date => {
  const months = [
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

  return `${ordinal(date.getDate())} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
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
