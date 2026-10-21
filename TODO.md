# TODO

## High Priority

- [ ] Check the Vercel project picks up `vercel.json` (it was set up as a Next.js project)
- [ ] Add unit tests for `lib/gears.ts` and `lib/fit/solve.ts` (the fit solver was checked against v2 by comparing rendered output, not by tests)

## Medium Priority

- [ ] Add frame geometry for drivetrain bikes (e.g. Surly Disc Trucker) so the gear calculator draws the real frame
- [ ] Add a form for suggesting frame geometry, stems and bars
- [ ] Improve the `Drivetrain` type to a discriminated union (hub vs cassette)
- [ ] Optional: import saved settings from the standalone v2 Fit Visualizer file

## Low Priority

- [ ] Add Biome and lefthook hooks as in innovation-growth-lab/irm (format staged files on pre-commit, `biome ci --changed` on pre-push); Biome could replace ESLint
- [ ] Optional: share a gear setup by URL

## Completed

- [x] Merge Fit Visualizer v2 as the `/fit` route
- [x] Move from Next.js to React Router 8 + Vite with static prerendering
- [x] Replace the three.js BikeViewer with the v2-style SVG drawing; wheels turn by gear ratio
- [x] Fix hub gear maths: hub ratios multiply the chain ratio (they were divided)
- [x] Split `lib/data.ts` into `lib/data/` and add bike geometry, stems and bars
- [x] Extract calculation logic to `lib/gears.ts` and constants (ranges, cadence)
- [x] Move Google Forms URLs to `lib/forms.ts`
- [x] Fix invalid HTML: links no longer nested in buttons; all external links use `rel="noopener noreferrer"`
- [x] Break down the BikeCalculator component; remove repeated input styling
- [x] Label inputs and table cells for screen readers; table cells print their values next to the colour
- [x] Replace dropdowns with searchable comboboxes
