export const getDefaultTheme = () => {
  const theme = localStorage.getItem('journalbook_theme');

  if (theme !== null) {
    return theme;
  }

  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return '';
};
