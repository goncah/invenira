import React, { ReactNode } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';
import ViewObjective from './components/objectives/ViewObjective';

const pageTransitionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const AnimateChildren = ({ children }: { children: ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

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
  component: () => (
    <AnimateChildren>
      <Home />
    </AnimateChildren>
  ),
});

const iapsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/iaps',
  component: () => (
    <AnimateChildren>
      <IAPs />
    </AnimateChildren>
  ),
});

const activitiesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activities',
  component: () => (
    <AnimateChildren>
      <Activities />
    </AnimateChildren>
  ),
});

const activityProvidersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/activity-providers',
  component: () => (
    <AnimateChildren>
      <ActivityProviders />
    </AnimateChildren>
  ),
});

const editIapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/edit-iap',
  component: () => (
    <AnimateChildren>
      <EditIAP />
    </AnimateChildren>
  ),
});

const viewIapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view-iap',
  component: () => (
    <AnimateChildren>
      <ViewIAP />
    </AnimateChildren>
  ),
});

const viewObjectiveRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/view-objective',
  component: () => (
    <AnimateChildren>
      <ViewObjective />
    </AnimateChildren>
  ),
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
  viewObjectiveRoute,
  logoutRoute,
  configInterfaceRoute,
]);

export const router = createRouter({ routeTree });

export default function App() {
  return <RouterProvider router={router} />;
}
