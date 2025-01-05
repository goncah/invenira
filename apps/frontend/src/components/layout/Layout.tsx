import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, PaletteMode } from '@mui/material/styles';
import { createContext, useContext, useEffect, useState } from 'react';
import { Container, GlobalStyles, ThemeProvider } from '@mui/material';
import Box from '@mui/material/Box';

interface ThemeContextProps {
  mode: PaletteMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps>(
  {} as unknown as ThemeContextProps,
);

export const useTheme = () => useContext(ThemeContext);

export default function Layout() {
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
    <div>
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
            <Navbar theme={theme} />
          </header>
          <main>
            <Container>
              <Box
                sx={{
                  pt: 30,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  gap: 4,
                }}
              >
                <Outlet />
              </Box>
            </Container>
          </main>
        </ThemeProvider>
      </ThemeContext.Provider>
    </div>
  );
}
