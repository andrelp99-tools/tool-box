import { Navigate, RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const Home = lazy(() => import('../pages/home'));
const ToolsByCategory = lazy(() => import('../pages/tools-by-category'));
// BenitoTools
const HistoryPage = lazy(() => import('../benito/pages/HistoryPage'));
const SettingsPage = lazy(() => import('../benito/pages/SettingsPage'));
const SharePage = lazy(() => import('../benito/pages/SharePage'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/categories/:categoryName',
    element: <ToolsByCategory />
  },
  { path: '/cronologia', element: <HistoryPage /> },
  { path: '/impostazioni', element: <SettingsPage /> },
  { path: '/condividi', element: <SharePage /> },
  {
    path: '*',
    element: <Navigate to="404" />
  }
];

export default routes;
