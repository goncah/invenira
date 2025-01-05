import './App.css';

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
import { CircularProgress } from '@mui/material';
import Logout from './components/Logout';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import React from 'react';

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <>
        <Typography variant="h4" component="div" sx={{ mr: 2 }}>
          Inven!RA
        </Typography>
        <CircularProgress />
      </>
    );
  }

  if (auth.error) {
    console.log(auth.error);
    return (
      <Typography variant="h4" component="div" sx={{ mr: 2 }}>
        Error
      </Typography>
    );
  }

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
  }

  return (
    <>
      <Typography variant="h4" component="div" sx={{ mr: 2 }}>
        Inven!RA
      </Typography>
      <Button color="inherit" onClick={() => auth.signinRedirect()}>
        Login
      </Button>
    </>
  );
}
