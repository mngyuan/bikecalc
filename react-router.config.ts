import type {Config} from '@react-router/dev/config';

// No runtime server: every route in app/routes.ts is rendered to static HTML
// at build time (build/client), and the app hydrates as an SPA from there.
export default {
  ssr: false,
  prerender: true,
} satisfies Config;
