# TODO

## High Priority

- [ ] Extract repeated Input styling to reusable constants (10+ instances of 150+ char className)
- [ ] Fix useCallback dependency issue in BikeCalculator onCustomized callback (line ~1061)
- [ ] Add `rel="noopener noreferrer"` to remaining external links (check all `target="_blank"`)
- [ ] Break down BikeCalculator component (~485 lines, 15+ state variables)
  - Extract: TireConfiguration, ChainringConfiguration, CassetteConfiguration, CalculationsDisplay
  - Consider custom hook for state management

## Medium Priority

- [ ] Split lib/data.ts into separate files (516 lines)
  - lib/data/tires.ts
  - lib/data/cassettes.ts
  - lib/data/bikes.ts
  - lib/data/types.ts
- [ ] Extract magic numbers to constants
  - Gear inches range (20, 120)
  - Meters development range (1, 10)
  - Speed range (1, 50)
  - Default cadence (80)
- [ ] Move Google Forms URLs to config file
- [ ] Fix invalid HTML: Button wrapping anchor tags (use `asChild` prop)
- [ ] Extract calculation logic to lib/calculations.ts
- [ ] Improve Bike type to use discriminated unions (IGH vs regular cassette)

## Low Priority

- [ ] Remove or integrate BikeViewer component (150+ lines of unused code)
- [ ] Add ARIA labels to inputs for accessibility
- [ ] Add text indicators alongside colors in calculation tables (accessibility)
- [ ] Add explicit return types to utility functions
- [ ] Add input validation to calculation functions (prevent NaN/Infinity)
- [ ] Configure Prettier/ESLint for consistent quote style

## Completed

- [x] Replace dropdowns with shadcn Popover/Command comboboxes
- [x] Create reusable SelectDropdown component
- [x] Add useMemo to CalculationsRow and HubCalculationsRow
- [x] Add React.memo to calculation components
