import {AppHeader} from '@/components/AppHeader';
import {FitVisualizer} from '@/components/fit/FitVisualizer';
import {loadSettings} from '@/lib/fit/state';
import type {Route} from './+types/fit';

export const meta = () => [
  {title: 'Fit Visualizer · Bike Calc'},
  {
    name: 'description',
    content:
      'Compare hand, saddle and toe positions across bikes, stems and bars.',
  },
];

// Settings live in localStorage, so they are read in the browser. The
// prerendered HTML shows the fallback below until then.
export async function clientLoader() {
  return {settings: loadSettings()};
}

export function HydrateFallback() {
  return (
    <div className="app">
      <aside>
        <AppHeader title={['Fit', 'Visualizer']} />
      </aside>
      <main>
        <div className="board loading">Loading your bikes…</div>
      </main>
    </div>
  );
}

export default function FitRoute({loaderData}: Route.ComponentProps) {
  return <FitVisualizer initial={loaderData.settings} />;
}
