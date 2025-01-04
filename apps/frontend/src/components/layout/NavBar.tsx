import { MouseEvent, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { darkTheme } from './Theme';
import { ThemeProvider } from '@mui/material';
import { useAuth } from 'react-oidc-context';

export default function Navbar() {
  const auth = useAuth();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleMenuOpen = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <AppBar position="fixed" color="primary">
        <Toolbar>
          <Button color="inherit" href="/">
            <Typography variant="h6" component="div" sx={{ mr: 2 }}>
              Inven!RA
            </Typography>
          </Button>
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            <Button color="inherit" href="/iaps">
              IAPs
            </Button>
            <Button color="inherit" href="/activities">
              Activities
            </Button>
            <Button color="inherit" href="/activity-providers">
              Activity Providers
            </Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleMenuOpen}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose} component="a" href="/iaps">
                IAPs
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                component="a"
                href="/activities"
              >
                Activities
              </MenuItem>
              <MenuItem
                onClick={handleMenuClose}
                component="a"
                href="/activity-providers"
              >
                Activity Providers
              </MenuItem>
            </Menu>
          </Box>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center' }}>
            {auth.user ? (
              <>
                <Typography variant="body1" sx={{ mr: 2 }}>
                  Logged in as {auth.user.profile.name}
                </Typography>
                <Button color="inherit" onClick={() => auth.signoutRedirect()}>
                  Log off
                </Button>
              </>
            ) : null}
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
}
