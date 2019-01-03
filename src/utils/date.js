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

export const ymd = (date = new Date()) => {
  const pad = n => (n < 10 ? "0" : "") + n;
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());

  return `${y}${m}${d}` // Example: 20190103
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
