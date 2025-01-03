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
import Logout from "./components/Logout";

export default function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div>
        <h2>Inven!RA</h2>
        <CircularProgress />
      </div>
    );
  }

  if (auth.error) {
    console.log(auth.error);
    return <div>Erro</div>;
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
    <div>
      <h2>Inven!RA</h2>
      <button onClick={() => auth.signinRedirect()}>Login</button>
    </div>
  );
}
