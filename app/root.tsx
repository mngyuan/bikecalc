import type {ReactNode} from 'react';
import {isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration} from 'react-router';
import type {Route} from './+types/root';
import appCss from './app.css?url';

export const links: Route.LinksFunction = () => [
  {rel: 'icon', href: '/favicon.ico'},
  {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
  {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous'},
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap',
  },
  {rel: 'stylesheet', href: appCss},
];

export function Layout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

// Rendered into the SPA fallback page that serves paths with no prerendered HTML
export function HydrateFallback() {
  return <div className="loading">Loading…</div>;
}

export function ErrorBoundary({error}: Route.ErrorBoundaryProps) {
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  return (
    <main style={{padding: 24, maxWidth: 640}}>
      <h1>{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="sub">
        {notFound ? 'There is nothing at this address.' : error instanceof Error ? error.message : 'Unknown error.'}
      </p>
      <p>
        <a href="/">Gear calculator</a> · <a href="/fit">Fit visualizer</a>
      </p>
    </main>
  );
}
