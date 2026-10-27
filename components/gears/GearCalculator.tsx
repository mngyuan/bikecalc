import {useState} from 'react';
import {AppHeader, MobileHeader} from '@/components/AppHeader';
import {Combobox, ExternalIcon, NumberField, type Option, Section, Segmented} from '@/components/controls';
import {
  BIKE_DB,
  type BikeID,
  bikeIDs,
  getBike,
  CASSETTE_DB,
  type CassetteID,
  DEFAULT_GEAR_BIKE,
  isSprocketCassette,
  REFERENCE_FRAME,
  TIRE_DB,
  type TireID,
} from '@/lib/data';
import {bikeFormURL, cassetteFormURL, hubFormURL, tireFormURL} from '@/lib/forms';
import {
  clampSel,
  configFromBike,
  DEFAULT_CADENCE_RPM,
  defaultSel,
  type GearConfig,
  type GearSel,
  hubRatios,
  isStock,
  type MetricKey,
  tireCircumference,
  tireDiameter,
} from '@/lib/gears';
import {GearBoard} from './GearBoard';
import {GearHero, GearTable} from './GearTable';

const TITLE: [string, string] = ['Gear', 'Calculator'];

const GEAR_BIKES = bikeIDs.filter((id) => getBike(id).drivetrain);
const bikeLabel = (id: BikeID) => {
  const b = getBike(id);
  return b.year ? `${b.name} (${b.year})` : b.name;
};
const BIKE_OPTIONS: Option<BikeID>[] = GEAR_BIKES.map((id) => ({value: id, label: bikeLabel(id)}));
const TIRE_OPTIONS: Option<TireID>[] = (Object.keys(TIRE_DB) as TireID[]).map((k) => ({value: k, label: k}));
const CASSETTE_OPTIONS: Option<CassetteID>[] = (Object.keys(CASSETTE_DB) as CassetteID[]).map((k) => ({
  value: k,
  label: k,
}));

const TIPS = {
  tire: "The part of the wheel which sits on the wheel's rim. Its actual diameter varies from its imperial naming, which affects gear inches and meters development.",
  width: 'The width in millimeters of the inflated tire. ETRTO stands for European Tire & Rim Technical Organization.',
  bsd: 'The inner diameter in millimeters of the tire. ETRTO stands for European Tire & Rim Technical Organization.',
  diameter: 'The outer diameter in inches of the inflated tire, calculated from ETRTO size. Used to calculate gear inches.',
  circumference: 'The distance in millimeters the tire travels in one revolution. Used to calculate meters development.',
  ratios:
    "How fast the hub's output turns for each turn of the sprocket: 1 is direct drive, below 1 is easier, above 1 is harder.",
};

const resize = (list: number[], n: number) =>
  n <= list.length ? list.slice(0, n) : [...list, ...Array(n - list.length).fill(list.at(-1) ?? 32)];
const count = (v: number, max: number) => Math.max(1, Math.min(max, Math.round(v)));

// Frame drawn for a bike: its own geometry if the catalog has it, else the reference.
function frameFor(id: BikeID | 'custom') {
  const geo = id !== 'custom' ? getBike(id).geometry : undefined;
  if (geo) return geo.sizes[geo.defaultSize];
  return BIKE_DB[REFERENCE_FRAME.bike].geometry.sizes[REFERENCE_FRAME.size];
}

export function GearCalculator() {
  const [bikeID, setBikeID] = useState<BikeID | 'custom'>(DEFAULT_GEAR_BIKE);
  const [cfg, setCfg] = useState<GearConfig>(() => configFromBike(DEFAULT_GEAR_BIKE) as GearConfig);
  const [metric, setMetric] = useState<MetricKey>('gearInches');
  const [cadence, setCadence] = useState(DEFAULT_CADENCE_RPM);
  const [pinned, setPinned] = useState<GearSel>(() => defaultSel(cfg));
  const [hover, setHover] = useState<GearSel | null>(null);

  const sel = clampSel(hover ?? pinned, cfg);
  const pinnedSel = clampSel(pinned, cfg);
  const update = (patch: Partial<GearConfig>) => setCfg((c) => ({...c, ...patch}));
  const hub = hubRatios(cfg);
  const frame = frameFor(bikeID);
  const stock = isStock(cfg, bikeID);

  const pickBike = (id: BikeID | 'custom') => {
    setBikeID(id);
    // "Custom" keeps the current numbers as a starting point
    if (id === 'custom') return;
    const next = configFromBike(id);
    if (next) {
      setCfg(next);
      setPinned(defaultSel(next));
    }
  };

  const pickTire = (id: TireID | 'custom') => {
    if (id === 'custom') return update({tireID: 'custom'});
    const [width, bsd] = TIRE_DB[id].ETRTOSize;
    update({tireID: id, width, bsd});
  };

  const pickCassette = (id: CassetteID | 'custom') => {
    // "Custom" keeps the current sprockets, and a hub keeps its ratios to edit
    if (id === 'custom') return update({cassetteID: 'custom'});
    const c = CASSETTE_DB[id];
    if (isSprocketCassette(c)) {
      update({cassetteID: id, sprockets: [...c.sprockets], ratios: null});
      if (hub) setPinned((p) => ({...p, sprocket: Math.floor(c.sprockets.length / 2), hub: 0}));
    } else {
      // moving to a hub from a cassette: start from one sprocket, not the whole cassette
      const wasHub = !!hub;
      update({
        cassetteID: id,
        ratios: [...c.ratios],
        sprockets: wasHub ? cfg.sprockets : [cfg.sprockets[Math.floor(cfg.sprockets.length / 2)] ?? 18],
      });
      setPinned((p) => ({...p, sprocket: 0, hub: Math.floor(c.ratios.length / 2)}));
    }
  };

  // Editing sprockets of a catalog cassette makes it custom. A hub keeps its
  // catalog entry, since bikes fit their own sprockets to a hub.
  const cassetteAfterSprocketEdit = (): GearConfig['cassetteID'] => (cfg.ratios ? cfg.cassetteID : 'custom');
  // Editing hub ratios always makes it a custom hub
  const setRatios = (ratios: number[]) => update({ratios, cassetteID: 'custom'});

  return (
    <div className="app">
      <aside>
        <AppHeader title={TITLE} sub="Calculate gear inches, meters development, and more for your bike." />
        <div className="card">
          <div className="card-head" style={{background: 'var(--hi)'}}>
            <div className="grow">
              <Combobox
                label="Bike"
                value={bikeID}
                options={BIKE_OPTIONS}
                onChange={pickBike}
                placeholder="Search bikes..."
                emptyMessage="No bike found."
              />
            </div>
          </div>
          <div className="card-body">
            {!stock && (
              <div className="rows" style={{paddingTop: 10}}>
                <p className="note">
                  {bikeID === 'custom' ? 'Custom setup.' : `Modified from the stock ${BIKE_DB[bikeID].name}.`}
                </p>
                <a
                  className="submit"
                  href={bikeFormURL(cfg.chainrings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tip="Submit this configuration as a new bike."
                >
                  Submit as a new bike <ExternalIcon />
                </a>
              </div>
            )}
            <Section title="Tire" defaultOpen>
              <Combobox
                label="Tire"
                value={cfg.tireID}
                options={TIRE_OPTIONS}
                onChange={pickTire}
                placeholder="Search tires..."
                emptyMessage="No tire found."
              />
              <div className="row">
                <label htmlFor="etrto-w" data-tip={TIPS.width}>
                  ETRTO width (mm)
                </label>
                <NumberField id="etrto-w" min={10} max={130} value={cfg.width} onChange={(v) => update({width: v, tireID: 'custom'})} />
              </div>
              <div className="row">
                <label htmlFor="etrto-d" data-tip={TIPS.bsd}>
                  ETRTO diameter (mm)
                </label>
                <NumberField id="etrto-d" min={150} max={700} value={cfg.bsd} onChange={(v) => update({bsd: v, tireID: 'custom'})} />
              </div>
              <div className="row">
                <span className="label" data-tip={TIPS.diameter}>
                  Tire diameter (in)
                </span>
                <div className="derived">{(tireDiameter(cfg.width, cfg.bsd) / 25.4).toFixed(2)}</div>
              </div>
              <div className="row">
                <span className="label" data-tip={TIPS.circumference}>
                  Tire circumference (mm)
                </span>
                <div className="derived">{Math.round(tireCircumference(cfg.width, cfg.bsd))}</div>
              </div>
              {cfg.tireID === 'custom' && (
                <a
                  className="submit"
                  href={tireFormURL(cfg.width, cfg.bsd)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tip="Submit this configuration as a new tire."
                >
                  Submit this tire <ExternalIcon />
                </a>
              )}
            </Section>

            <Section title="Chainrings" defaultOpen>
              <div className="row">
                <label htmlFor="ring-n">Number of chainrings</label>
                <NumberField
                  id="ring-n"
                  min={1}
                  max={4}
                  value={cfg.chainrings.length}
                  onChange={(v) => update({chainrings: resize(cfg.chainrings, count(v, 4))})}
                />
              </div>
              <div className="teeth">
                {cfg.chainrings.map((t, i) => (
                  <NumberField
                    key={i}
                    label={`Chainring ${cfg.chainrings.length - i} teeth`}
                    min={10}
                    max={80}
                    value={t}
                    onChange={(v) => update({chainrings: cfg.chainrings.with(i, v)})}
                  />
                ))}
              </div>
            </Section>

            <Section title="Cassette / hub" defaultOpen>
              <Combobox
                label="Cassette or hub"
                value={cfg.cassetteID}
                options={CASSETTE_OPTIONS}
                onChange={pickCassette}
                placeholder="Search cassettes..."
                emptyMessage="No cassette found."
              />
              <div className="row">
                <label htmlFor="cog-n">Number of sprockets</label>
                <NumberField
                  id="cog-n"
                  min={1}
                  max={14}
                  value={cfg.sprockets.length}
                  onChange={(v) =>
                    update({sprockets: resize(cfg.sprockets, count(v, 14)), cassetteID: cassetteAfterSprocketEdit()})
                  }
                />
              </div>
              <div className="teeth">
                {cfg.sprockets.map((t, i) => (
                  <NumberField
                    key={i}
                    label={`Sprocket ${cfg.sprockets.length - i} teeth`}
                    min={8}
                    max={60}
                    value={t}
                    onChange={(v) => update({sprockets: cfg.sprockets.with(i, v), cassetteID: cassetteAfterSprocketEdit()})}
                  />
                ))}
              </div>
              {cfg.ratios && (
                <>
                  <div className="row">
                    <label htmlFor="hub-n">Number of hub gears</label>
                    <NumberField
                      id="hub-n"
                      min={1}
                      max={14}
                      value={cfg.ratios.length}
                      onChange={(v) => cfg.ratios && setRatios(resize(cfg.ratios, count(v, 14)))}
                    />
                  </div>
                  <span className="label" style={{fontSize: 13}} data-tip={TIPS.ratios}>
                    Hub ratios, gear 1 first
                  </span>
                  <div className="teeth">
                    {cfg.ratios.map((r, i) => (
                      <NumberField
                        key={i}
                        label={`Hub gear ${i + 1} ratio`}
                        min={0.1}
                        max={5}
                        step={0.01}
                        value={r}
                        onChange={(v) => cfg.ratios && setRatios(cfg.ratios.with(i, v))}
                      />
                    ))}
                  </div>
                </>
              )}
              {cfg.cassetteID === 'custom' && (
                <a
                  className="submit"
                  href={cfg.ratios ? hubFormURL(cfg.ratios, cfg.sprockets) : cassetteFormURL(cfg.sprockets)}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-tip={`Submit this configuration as a new ${cfg.ratios ? 'hub' : 'cassette'}.`}
                >
                  Submit this {cfg.ratios ? 'hub' : 'cassette'} <ExternalIcon />
                </a>
              )}
            </Section>
          </div>
        </div>
        <p className="note">
          Bikes, tires and cassettes come from a catalog in this app. Missing one? Use the submit links, which appear
          when a value no longer matches the catalog.
        </p>
      </aside>

      <main>
        <MobileHeader title={TITLE} />
        <section className="readout">
          <div className="hero-col">
            <div className="toolbar">
              <Segmented
                label="Value shown in the table"
                value={metric}
                options={[
                  ['gearInches', 'Gear inches'],
                  ['development', 'Development'],
                  ['speed', 'Speed'],
                ]}
                onChange={setMetric}
              />
            </div>
            <GearHero cfg={cfg} sel={sel} metric={metric} cadence={cadence} />
          </div>
          <div className="tablewrap">
            <GearTable
              cfg={cfg}
              metric={metric}
              cadence={cadence}
              pinned={pinnedSel}
              onHover={setHover}
              onPick={(s) => {
                setPinned(s);
                setHover(null);
              }}
            />
          </div>
        </section>
        <GearBoard cfg={cfg} sel={sel} frame={frame} cadence={cadence} onCadence={setCadence} />
        <p className="foot-note">
          Wheels, tires, chainrings and sprockets are drawn to scale on a {frame.label} frame.
        </p>
      </main>
    </div>
  );
}
