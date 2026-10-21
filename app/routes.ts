import {type RouteConfig, index, route} from '@react-router/dev/routes';

export default [
  index('routes/gears.tsx'),
  route('fit', 'routes/fit.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
