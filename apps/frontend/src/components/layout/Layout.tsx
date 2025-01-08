import Navbar from './NavBar';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, PaletteMode } from '@mui/material/styles';
import React, {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  CircularProgress,
  GlobalStyles,
  Grid2,
  ThemeProvider,
  Typography,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import Button from '@mui/material/Button';
import { useAuth } from 'react-oidc-context';
import { Outlet } from '@tanstack/react-router';

interface ThemeContextProps {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>(
  {} as unknown as ThemeContextProps,
);

interface ErrorProps {
  showError: (message: string) => void;
}

let ErrorContext = createContext<ErrorProps>({ showError: () => null });

export const useError = () => useContext(ErrorContext);

export const useTheme = () => useContext(ThemeContext);

export default function Layout() {
  const auth = useAuth();

  const [error, setError] = useState({ open: false, message: '' });

  const handleErrorClose = () => {
    setError({ open: false, message: '' });
  };

  const handleError = (message: string) => {
    setError({ open: true, message });
  };

  ErrorContext = createContext<ErrorProps>({ showError: handleError });

  const [mode, setMode] = useState<PaletteMode>(() => {
    return (localStorage.getItem('theme') as PaletteMode) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const theme = createTheme({
    palette: {
      mode,
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              backgroundColor: theme.palette.background.default,
              color: theme.palette.text.primary,
              margin: 0,
              padding: 0,
              fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            },
          }}
        />
        <header>
          <Navbar />
        </header>
        <main>
          <Grid2
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
          >
            <Grid2>
              {auth.isAuthenticated ? (
                <QueryErrorResetBoundary>
                  {({ reset }) => (
                    <ErrorBoundary
                      onReset={reset}
                      fallbackRender={({ resetErrorBoundary, error }) => (
                        <Typography
                          variant="h5"
                          component="div"
                          sx={{ textAlign: 'center' }}
                        >
                          {error.message.toString()}
                          <br />
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() =>
                              startTransition(() => resetErrorBoundary())
                            }
                            sx={{ mt: 2 }}
                          >
                            Retry
                          </Button>
                        </Typography>
                      )}
                    >
                      <Outlet />
                    </ErrorBoundary>
                  )}
                </QueryErrorResetBoundary>
              ) : (
                <Typography
                  variant="h4"
                  component="div"
                  sx={{ textAlign: 'center' }}
                >
                  Inven!RA
                  <br />
                  {auth.isLoading ? (
                    <CircularProgress />
                  ) : auth.error ? (
                    'Error'
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => auth.signinRedirect()}
                    >
                      Login
                    </Button>
                  )}
                </Typography>
              )}
            </Grid2>
          </Grid2>
          <Snackbar
            open={error.open}
            autoHideDuration={6000}
            onClose={handleErrorClose}
          >
            <Alert
              onClose={handleErrorClose}
              severity="error"
              sx={{ width: '100%' }}
            >
              {error.message}
            </Alert>
          </Snackbar>
        </main>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
