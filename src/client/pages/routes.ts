import { RouteConfig } from 'react-router-config';
import { paths } from './paths';
import { HomePage } from './home';

export const ROUTES: RouteConfig[] = [
  {
    path: paths.home(),
    exact: true,
    component: HomePage,
  },
];
