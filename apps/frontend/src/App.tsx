import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Activities from './components/activities/Activities';
import ActivityProviders from './components/activity-providers/ActivityProviders';
import IAPs from './components/iaps/IAPs';
import ConfigInterface from './components/ConfigInterface';
import Layout from './components/layout/Layout';
import ViewIAP from './components/iaps/ViewIAP';
import EditIAP from './components/iaps/EditIAP';
import { useAuth } from 'react-oidc-context';
import { CircularProgress, Grid2 } from '@mui/material';
import Logout from './components/Logout';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function App() {
  const auth = useAuth();

  if (auth.isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/config-interface" element={<ConfigInterface />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/activity-providers" element={<ActivityProviders />} />
            <Route path="/iaps" element={<IAPs />} />
            <Route path="/view-iap" element={<ViewIAP />} />
            <Route path="/edit-iap" element={<EditIAP />} />
            <Route path="/logout" element={<Logout />} />
          </Route>
        </Routes>
      </Router>
    );
  } else {
    return (
      <Grid2
        container
        spacing={0}
        direction="column"
        alignItems="center"
        justifyContent="center"
        sx={{ minHeight: '100vh' }}
      >
        <Grid2>
          <Typography variant="h4" component="div" sx={{ textAlign: 'center' }}>
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
        </Grid2>
      </Grid2>
    );
  }
}
