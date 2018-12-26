export const double = n => (n < 9 ? `0${n}` : n);

export const url = (date = new Date()) => {
  return `/${date.getFullYear()}/${double(date.getMonth() + 1)}/${double(
    date.getDate()
  )}/`;
};

export const ymd = date => {
  return `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
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
    'Dec'
  ];

  return `${ordinal(date.getDate())} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
};
