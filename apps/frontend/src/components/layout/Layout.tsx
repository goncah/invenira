import { Outlet } from 'react-router-dom';
import Navbar from './NavBar';
import CssBaseline from '@mui/material/CssBaseline';

export default function Layout() {
  return (
    <div>
      <CssBaseline />
      <header>
        <Navbar />
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
