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

export const prefersAnimation = (settings = {}) => {
  const preference = settings.animation || null;

  if (preference !== null) {
    return preference;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'off';
  }

  return '';
};
