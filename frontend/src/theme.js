import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Royal blue - professional and educational
      light: '#757de8',
      dark: '#002984',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#f50057', // Vibrant pink for accent
      light: '#ff5983',
      dark: '#bb002f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
    success: {
      main: '#4caf50',
      light: '#80e27e',
      dark: '#087f23',
    },
    error: {
      main: '#f44336',
    },
    text: {
      primary: '#212121',
      secondary: '#616161',
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none', // Avoid all-caps buttons
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(0, 0, 0, 0.05)',
    '0px 4px 8px rgba(0, 0, 0, 0.05)',
    '0px 6px 12px rgba(0, 0, 0, 0.08)',
    '0px 8px 16px rgba(0, 0, 0, 0.08)',
    '0px 10px 20px rgba(0, 0, 0, 0.1)',
    '0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 14px 28px rgba(0, 0, 0, 0.14)',
    '0px 16px 32px rgba(0, 0, 0, 0.16)',
    '0px 18px 36px rgba(0, 0, 0, 0.18)',
    '0px 20px 40px rgba(0, 0, 0, 0.2)',
    '0px 22px 44px rgba(0, 0, 0, 0.22)',
    '0px 24px 48px rgba(0, 0, 0, 0.24)',
    '0px 26px 52px rgba(0, 0, 0, 0.26)',
    '0px 28px 56px rgba(0, 0, 0, 0.28)',
    '0px 30px 60px rgba(0, 0, 0, 0.3)',
    '0px 32px 64px rgba(0, 0, 0, 0.32)',
    '0px 34px 68px rgba(0, 0, 0, 0.34)',
    '0px 36px 72px rgba(0, 0, 0, 0.36)',
    '0px 38px 76px rgba(0, 0, 0, 0.38)',
    '0px 40px 80px rgba(0, 0, 0, 0.4)',
    '0px 42px 84px rgba(0, 0, 0, 0.42)',
    '0px 44px 88px rgba(0, 0, 0, 0.44)',
    '0px 46px 92px rgba(0, 0, 0, 0.46)',
    '0px 48px 96px rgba(0, 0, 0, 0.48)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '8px 22px',
          fontSize: '0.875rem',
          boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            backgroundColor: '#3a47a1',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover fieldset': {
              borderColor: '#3f51b5',
            },
          },
        },
      },
    },
  },
});

export default theme; 