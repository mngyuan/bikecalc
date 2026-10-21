# Bike Calc

Two tools that share one bike catalog:

- **Gear calculator** (`/`): gear inches, meters development and speed for every chainring × sprocket (or hub gear), with a to-scale side drawing of the bike. The chain sits on the selected gear; cranks turn at the cadence and wheels at cadence × gear ratio.
- **Fit visualizer** (`/fit`): compare hand, saddle and toe positions across bikes, stems and bars, drawn from the side and from above. Settings are saved in the browser.

## Development

Requires Node 22.22 or newer.

```bash
npm install
npm run dev        # dev server
npm run build      # static site in build/client
npm run preview    # serve build/client locally
npm run typecheck
npm run lint
```

## Stack

React Router 8 in framework mode on Vite, with `ssr: false` and `prerender: true` (`react-router.config.ts`). Every route is rendered to static HTML at build time, so there is no server: deploy `build/client` to any static host. `vercel.json` sets this up on Vercel. Paths with no page get `404.html`, which hydrates into the app's not-found page.

Styling is plain CSS with design tokens in `app/app.css`, including dark mode. The searchable selects use Radix Popover and cmdk.

## Layout

```
app/                 root layout, routes, styles
components/board/    drafting board, mm grid, frame and wheel drawing shared by both tools
components/gears/    gear calculator: sidebar, heat-map table, drivetrain drawing
components/fit/      fit visualizer: bike cards, readouts, side and top views
lib/data/            catalog: tires, cassettes, bikes, stems and bars
lib/gears.ts         gear maths
lib/fit/             fit solver, saved settings, sidebar layout
lib/frame.ts         frame key points from stack, reach and angles
```

## Data

The catalog is a set of typed static modules in `lib/data/`.

- A bike in `bikes.ts` can have a `drivetrain`, a `geometry`, or both. With a drivetrain it appears in the gear calculator. With geometry it appears in the fit visualizer, and the gear calculator draws its real frame instead of the reference frame.
- Hub `ratios` in `cassettes.ts` are hub output speed over sprocket speed, gear 1 first, so 1.0 is direct drive.
- Stem and bar keys in `cockpit.ts` are stored in saved fit settings. Rename one only with a migration in `lib/fit/state.ts`.
- Missing tires, cassettes and bikes can be suggested through the Google Forms in `lib/forms.ts`.
