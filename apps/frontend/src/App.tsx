import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
  useRouter,
} from '@tanstack/react-router';
import Layout from './components/layout/Layout';
import Home from './components/Home';
import Activities from './components/activities/Activities';
import ActivityProviders from './components/activity-providers/ActivityProviders';
import IAPs from './components/iaps/IAPs';
import ConfigInterface from './components/ConfigInterface';
import ViewIAP from './components/iaps/ViewIAP';
import EditIAP from './components/iaps/EditIAP';
import Logout from './components/Logout';

const rootRoute = createRootRoute({
  component: () => {
    // eslint-disable-next-line
    const router = useRouter();
    const currentPath = router.state.location.pathname;

    const replacePath = '/config-interface';
    return currentPath === replacePath ? <Outlet /> : <Layout />;
  },
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <Home />,
});

const iapsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/iaps',
  component: () => <IAPs />,
});

const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities',
  component: () => <Activities />,
});

const activityProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity-providers',
  component: () => <ActivityProviders />,
});

const editIapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-iap',
  component: () => <EditIAP />,
});

const viewIapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view-iap',
  component: () => <ViewIAP />,
});

const logoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/logout',
  component: () => <Logout />,
});

const configInterfaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/config-interface',
  component: () => <ConfigInterface />,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  iapsRoute,
  activitiesRoute,
  activityProvidersRoute,
  editIapRoute,
  viewIapRoute,
  logoutRoute,
  configInterfaceRoute,
]);

export const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
