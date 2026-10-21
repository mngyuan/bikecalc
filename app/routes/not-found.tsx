// Catch-all for paths with no prerendered page. They are served the SPA
// fallback HTML (root HydrateFallback); this route's clientLoader makes the
// first client render match it before the 404 shows, avoiding a hydration error.

export const meta = () => [{title: 'Not found · Bike Calc'}];

export async function clientLoader() {
  return null;
}

export function HydrateFallback() {
  return <div className="loading">Loading…</div>;
}

export default function NotFound() {
  return (
    <main style={{padding: 24, maxWidth: 640}}>
      <h1>Page not found</h1>
      <p className="sub">There is nothing at this address.</p>
      <p>
        <a href="/">Gear calculator</a> · <a href="/fit">Fit visualizer</a>
      </p>
    </main>
  );
}
