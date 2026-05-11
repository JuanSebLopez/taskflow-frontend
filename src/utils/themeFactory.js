const themeMap = {
  LIGHT: {
    name: 'LIGHT',
    documentTheme: 'LIGHT',
  },
  DARK: {
    name: 'DARK',
    documentTheme: 'DARK',
  },
};

export const createTheme = (themeName = 'LIGHT') => {
  return themeMap[themeName] || themeMap.LIGHT;
};
