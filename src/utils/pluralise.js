export const pluralise = (string, count = 0, alt = '') => {
  return count !== 1 ? alt || string + 's' : string;
};
