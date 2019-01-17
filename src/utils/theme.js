export const getDefaultTheme = (settings = {}) => {
  const theme = settings.theme || null;

  if (theme !== null) {
    return theme;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return '';
};
