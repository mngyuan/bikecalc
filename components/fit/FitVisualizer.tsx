import {type Dispatch, type ReactNode, useEffect, useMemo, useReducer, useRef} from 'react';
import {AppHeader, MobileHeader} from '@/components/AppHeader';
import {NumberField, Section, Segmented} from '@/components/controls';
import {BAR_DB, BIKE_DB, STEM_DB, type BarID, type StemID} from '@/lib/data';
import {
  bikeName,
  bikeShort,
  bikeYear,
  colorOf,
  FIT_BIKES,
  type FitBikeID,
  geometryOf,
  STAGED_COLOR,
} from '@/lib/fit/bikes';
import {SECTIONS, type SectionItem, TIPS} from '@/lib/fit/sections';
import {dropEnds, isMatched, solve, type Solved, strikeAngle, widthGain} from '@/lib/fit/solve';
import {
  editTarget,
  type FitAction,
  type FitSettings,
  type FitState,
  fitReducer,
  initFitState,
  isDirty,
  saveSettings,
} from '@/lib/fit/state';
import {sgn, sub} from '@/lib/vec';
import {type Drawn, SideBoard, TopBoard} from './FitBoards';

const TITLE: [string, string] = ['Fit', 'Visualizer'];
const r = Math.round;

export function FitVisualizer({initial}: {initial: FitSettings}) {
  const [st, dispatch] = useReducer(fitReducer, initial, initFitState);
  const {saved, stage} = st;
  useEffect(() => saveSettings(saved), [saved]);

  const dirty = isDirty(st);
  const Gs = useMemo(() => new Map(saved.bikes.map((id) => [id, solve(saved, id)])), [saved]);
  const GS = useMemo(() => (stage ? solve(saved, stage.id, stage.data, true) : null), [saved, stage]);
  const solved = (id: FitBikeID) => Gs.get(id) as Solved;

  const visible = saved.bikes.filter((k) => saved.bike[k].show);
  const drawn: Drawn[] = visible.map((id) => ({G: solved(id), color: colorOf(id)}));
  const stagedDrawn: Drawn | null =
    dirty && stage && GS && saved.bike[stage.id].show ? {G: GS, color: STAGED_COLOR} : null;

  return (
    <div className="app">
      <aside>
        <AppHeader title={TITLE} />
        <div className="cards">
          {saved.bikes.map((id) => (
            <BikeCardWithStage
              key={id}
              id={id}
              st={st}
              G={stage?.id === id && GS ? GS : solved(id)}
              dirty={dirty}
              dispatch={dispatch}
            />
          ))}
        </div>
        <div className="card">
          <div className="card-body">
            <Section title="Rider assumptions" defaultOpen>
              <div className="row">
                <label htmlFor="g-shoulder" data-tip="Distance between the centres of your shoulder joints">
                  Shoulder joint width
                </label>
                <NumberField
                  id="g-shoulder"
                  min={300}
                  max={520}
                  step={5}
                  value={saved.shoulder}
                  onChange={(v) => dispatch({type: 'global', key: 'shoulder', value: v})}
                />
              </div>
              <div className="row">
                <label htmlFor="g-arm" data-tip="Straight line from shoulder to palm while riding">
                  Shoulder → hand distance
                </label>
                <NumberField
                  id="g-arm"
                  min={450}
                  max={750}
                  step={5}
                  value={saved.arm}
                  onChange={(v) => dispatch({type: 'global', key: 'arm', value: v})}
                />
              </div>
              <p className="note">
                Used to estimate how much reach a narrower bar gives back, since your arms angle in less.
              </p>
            </Section>
          </div>
        </div>
        <p className="note">
          Geometry from {geometrySources()}. Saddle and foot figures are example values: set them to yours.
          Settings are saved in this browser.
        </p>
      </aside>

      <main>
        <MobileHeader title={TITLE} />
        <section className="readout">
          <div className="hero-col">
            <Toolbar saved={saved} dispatch={dispatch} />
            <div className="hero">
              <div className="hero-body">
                <Hero st={st} solved={solved} GS={dirty ? GS : null} visible={visible} />
              </div>
              <p className="note hero-foot">
                The hand point is where your palm rests: on the hoods for drops, on the GP3 wing for the riser. Toe
                clearance is measured 25mm above the pedal spindle with the crank level and forward. All values
                in mm.
              </p>
              <Readout st={st} solved={solved} GS={dirty ? GS : null} visible={visible} part="warnings" />
            </div>
          </div>
          <div className="tablewrap">
            <Readout st={st} solved={solved} GS={dirty ? GS : null} visible={visible} part="table" />
          </div>
        </section>

        <SideBoard bikes={drawn} staged={stagedDrawn} />
        <TopBoard
          bikes={drawn}
          staged={stagedDrawn}
          steer={saved.steer}
          onSteer={(v) => dispatch({type: 'global', key: 'steer', value: v})}
        />
        <p className="foot-note">Bikes overlaid at bottom bracket</p>
      </main>
    </div>
  );
}

function geometrySources() {
  const by = new Map<string, string[]>();
  for (const id of FIT_BIKES) {
    const src = geometryOf(id).source;
    by.set(src, [...(by.get(src) ?? []), `${bikeShort(id) ?? bikeName(id)} ${bikeYear(id) ?? ''}`.trim()]);
  }
  return [...by].map(([src, names]) => `${src} (${names.join(', ')})`).join(' and ');
}

/* ---------- sidebar ---------- */

function BikeCardWithStage(props: {
  id: FitBikeID;
  st: FitState;
  G: Solved;
  dirty: boolean;
  dispatch: Dispatch<FitAction>;
}) {
  const {id, st, dirty, dispatch} = props;
  return (
    <>
      <BikeCard {...props} />
      {st.stage?.id === id && (
        <div className="stage-bar" hidden={!dirty}>
          <span>
            <i className="key" />
            Unsaved changes, drawn dashed on the boards
          </span>
          <button type="button" className="reset" onClick={() => dispatch({type: 'resetStage'})}>
            Reset
          </button>
          <button type="button" className="save" onClick={() => dispatch({type: 'saveStage'})}>
            Save
          </button>
        </div>
      )}
    </>
  );
}

function BikeCard({id, st, G, dispatch}: {id: FitBikeID; st: FitState; G: Solved; dispatch: Dispatch<FitAction>}) {
  const s = editTarget(st, id);
  const geo = geometryOf(id);
  const name = bikeName(id);
  return (
    <div className={`card${st.saved.bike[id].show ? '' : ' off'}`}>
      <div className="card-head" style={{background: colorOf(id).chip}}>
        <div className="grow">
          <b>{name}</b> <small>{bikeYear(id)}</small>
        </div>
        <select
          aria-label={`${name} size`}
          value={s.size}
          onChange={(e) => dispatch({type: 'size', id, value: e.target.value})}
        >
          {Object.entries(geo.sizes).map(([k, z]) => (
            <option key={k} value={k}>
              {z.label}
            </option>
          ))}
        </select>
        <button type="button" className="x" aria-label={`Remove ${name}`} onClick={() => dispatch({type: 'remove', id})}>
          Remove
        </button>
      </div>
      <div className="card-body">
        {SECTIONS.map((sec) => (
          <Section key={sec.title} title={sec.title} defaultOpen={sec.open}>
            {sec.items.map((it, i) => (
              <Item key={i} item={it} id={id} st={st} G={G} dispatch={dispatch} section={sec.title} />
            ))}
          </Section>
        ))}
      </div>
    </div>
  );
}

function Item({
  item,
  id,
  st,
  G,
  dispatch,
  section,
}: {
  item: SectionItem;
  id: FitBikeID;
  st: FitState;
  G: Solved;
  dispatch: Dispatch<FitAction>;
  section: string;
}) {
  const s = editTarget(st, id);
  const uid = `${id}-${item.type === 'num' ? item.k : item.type}`;
  switch (item.type) {
    case 'stemPreset':
      return (
        <div>
          <select
            id={uid}
            aria-label={`${section} preset`}
            value={s.stemPreset}
            onChange={(e) => dispatch({type: 'stemPreset', id, value: e.target.value as StemID | ''})}
          >
            <option value="">Custom</option>
            {Object.entries(STEM_DB).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'barPreset':
      return (
        <div>
          <select
            id={uid}
            aria-label={`${section} preset`}
            value={s.barPreset}
            onChange={(e) => dispatch({type: 'barPreset', id, value: e.target.value as BarID | ''})}
          >
            <option value="">Custom</option>
            {Object.entries(BAR_DB).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      );
    case 'stemType':
      return (
        <Segmented
          label="Stem type"
          value={s.stemType}
          options={[
            ['std', 'Standard'],
            ['goose', 'Tall / gooseneck'],
          ]}
          onChange={(v) => dispatch({type: 'stemType', id, value: v})}
        />
      );
    case 'barType':
      return (
        <Segmented
          label="Bar type"
          value={s.barType}
          options={[
            ['drop', 'Drop'],
            ['riser', 'Riser'],
          ]}
          onChange={(v) => dispatch({type: 'barType', id, value: v})}
        />
      );
    case 'above':
      return (
        <div className="row">
          <span className="label" data-tip={TIPS._above}>
            Spacers above stem
          </span>
          <div className="derived">
            {s.stemType === 'goose' ? (
              `${r(G.insert ?? 0)} in stem`
            ) : G.above < -0.5 ? (
              <span className="warnTxt">{sgn(G.above)}</span>
            ) : (
              r(G.above)
            )}
          </div>
        </div>
      );
    case 'match': {
      // skip bikes whose saddle already follows this one, which would make a loop
      const followsThis = (k: FitBikeID): boolean => {
        for (let m = k, n = 0; n < 4 && isMatched(st.saved, m); n++) {
          m = st.saved.bike[m].matchTo as FitBikeID;
          if (m === id) return true;
        }
        return false;
      };
      const others = st.saved.bikes.filter((k) => k !== id && !followsThis(k));
      return (
        <div className="row">
          <label htmlFor={uid} data-tip={TIPS.matchTo}>
            Saddle position
          </label>
          <span />
          <select
            id={uid}
            className="wide"
            value={isMatched(st.saved, id, s) ? s.matchTo : ''}
            onChange={(e) => dispatch({type: 'match', id, value: e.target.value as FitBikeID | ''})}
          >
            <option value="">Set manually</option>
            {others.map((k) => (
              <option key={k} value={k}>
                Same as {bikeShort(k) ?? bikeName(k)}
              </option>
            ))}
          </select>
        </div>
      );
    }
    case 'saddle':
      if (!item.when(s, id, st.saved)) return null;
      return (
        <div className="rows" style={{paddingBottom: 0}}>
          <div className="row">
            <span className="label" data-tip={TIPS._sH}>
              Saddle height
            </span>
            <div className="derived">{r(G.sH)}</div>
          </div>
          <div className="row">
            <span className="label" data-tip={TIPS._sO}>
              Post setback needed
            </span>
            <div className="derived">{r(G.sO)}</div>
          </div>
        </div>
      );
    case 'num': {
      if (item.when && !item.when(s, id, st.saved)) return null;
      const set = (v: number) => dispatch({type: 'set', id, key: item.k, value: v});
      return (
        <div className="row">
          <label htmlFor={uid} data-tip={TIPS[item.k]}>
            {item.label}
          </label>
          <NumberField id={uid} min={item.min} max={item.max} step={item.step} value={s[item.k]} onChange={set} />
          {item.slider && (
            <input
              type="range"
              min={item.min}
              max={item.max}
              step={item.step}
              value={s[item.k]}
              aria-label={item.label}
              onChange={(e) => set(parseFloat(e.target.value))}
            />
          )}
        </div>
      );
    }
  }
}

function Toolbar({saved, dispatch}: {saved: FitSettings; dispatch: Dispatch<FitAction>}) {
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const m = menu.current;
      if (m?.open && !m.contains(e.target as Node)) m.open = false;
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);
  const avail = FIT_BIKES.filter((k) => !saved.bikes.includes(k));
  return (
    <div className="toolbar">
      {saved.bikes.map((id) => (
        <button
          key={id}
          type="button"
          className="pill"
          aria-pressed={saved.bike[id].show}
          onClick={() => dispatch({type: 'toggle', id})}
        >
          <span className="dot" style={{background: colorOf(id).c}} />
          {bikeShort(id) ?? bikeName(id)}
        </button>
      ))}
      <details className="addmenu" ref={menu}>
        <summary className="pill ghost">+ Add bike</summary>
        <div className="menu">
          {avail.length ? (
            avail.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (menu.current) menu.current.open = false;
                  dispatch({type: 'add', id: k});
                }}
              >
                <span className="dot" style={{background: colorOf(k).c}} />
                {BIKE_DB[k].name}
              </button>
            ))
          ) : (
            <div className="empty">All bikes are already added</div>
          )}
        </div>
      </details>
    </div>
  );
}

/* ---------- readouts ---------- */

interface ReadoutProps {
  st: FitState;
  solved: (id: FitBikeID) => Solved;
  GS: Solved | null; // staged solve, only when it differs from saved
  visible: FitBikeID[];
}

function Hero({st, solved, GS, visible}: ReadoutProps) {
  const {saved, stage} = st;
  if (GS && stage) {
    const O = solved(stage.id);
    const r1 = sub(GS.hand, GS.N),
      r0 = sub(O.hand, O.N),
      dx = r1[0] - r0[0],
      dy = r1[1] - r0[1];
    const nx = GS.N[0] - O.N[0],
      ny = GS.N[1] - O.N[1];
    return (
      <>
        <span className="eyebrow">Staged changes vs saved {bikeShort(stage.id)}</span>
        <Big dx={dx} dy={dy} />
        <div>
          <span className="chip hi">Hands move {r(Math.hypot(dx, dy))} mm relative to the saddle</span>
        </div>
        <p className="note">
          {Math.hypot(nx, ny) >= 1 ? `Saddle nose moves ${sgn(nx)} fwd, ${sgn(ny)} up. ` : ''}
          The dashed outline shows the staged version. Save to keep it or Reset to go back.
        </p>
      </>
    );
  }
  if (visible.length === 2) {
    const [a, c] = visible,
      A = solved(a),
      C = solved(c);
    const relA = sub(A.hand, A.N),
      relC = sub(C.hand, C.N);
    const dx = relA[0] - relC[0],
      dy = relA[1] - relC[1],
      dist = Math.hypot(dx, dy);
    const gain = widthGain(saved, C.handW, A.handW);
    const distAdj = Math.hypot(dx - gain, dy),
      tol = 15;
    const sameSaddle = Math.hypot(A.N[0] - C.N[0], A.N[1] - C.N[1]) < 1;
    return (
      <>
        <span className="eyebrow">
          {bikeShort(a)} hands vs {bikeShort(c)}
          {sameSaddle ? '' : ' · relative to saddle nose'}
        </span>
        <Big dx={dx} dy={dy} />
        <div>
          <span className={`chip ${distAdj <= tol ? 'ok' : 'warn'}`}>
            {r(dist)} mm apart{Math.abs(gain) >= 1 ? ` · ${r(distAdj)} width-adjusted` : ''}
          </span>
        </div>
        <p className="note">
          {Math.abs(gain) >= 1
            ? `Hands ${r(C.handW)} → ${r(A.handW)} wide is worth about ${sgn(gain)} mm of reach at ${saved.shoulder} mm shoulders and a ${saved.arm} mm arm. `
            : ''}
          Green when within {tol} mm after width adjustment.
        </p>
      </>
    );
  }
  return (
    <>
      <span className="eyebrow">Hand position</span>
      <p className="note">
        {visible.length < 2 ? 'Show two bikes' : 'Hide all but two bikes'} to compare hand positions. The first one
        shown is compared against the second.
      </p>
    </>
  );
}

function Big({dx, dy}: {dx: number; dy: number}) {
  return (
    <div className="big">
      <span>{sgn(dx)} fwd</span> · <span>{sgn(dy)} up</span>
    </div>
  );
}

interface Col {
  id: FitBikeID;
  G: Solved;
  label: string;
  dot: string;
  strike: number | null;
}

const ROWS: [string, (G: Solved, strike: number | null) => ReactNode][] = [
  ['Hands from BB (fwd, up)', (G) => `${r(G.hand[0])}, ${r(G.hand[1])}`],
  [
    'Saddle nose → hands (reach, drop)',
    (G) => {
      const d = sub(G.hand, G.N);
      return `${r(d[0])}, ${r(-d[1])}`;
    },
  ],
  ['Hand width', (G) => r(G.handW)],
  [
    'Bar width: hoods / drop bend / drop ends',
    (G) => {
      if (G.s.barType !== 'drop') return r(G.s.rW);
      const D = dropEnds(G.s);
      return `${r(G.s.dW)} / ${r(2 * D.bendW)} / ${r(2 * D.endW)}`;
    },
  ],
  ['Bar clamp from BB', (G) => `${r(G.K[0])}, ${r(G.K[1])}`],
  [
    'Steerer: spacers below / above',
    (G) =>
      G.s.stemType === 'std' ? (
        <>
          {r(G.base - G.s.hs)} / {G.above < -0.5 ? <span className="warnTxt">{sgn(G.above)}</span> : r(G.above)}
        </>
      ) : (
        `${r(G.base - G.s.hs)} / ${r(G.insert ?? 0)} in stem`
      ),
  ],
  ['Saddle height / post setback', (G) => `${r(G.sH)} / ${r(G.sO)}`],
  ['Tyre → pedal spindle', (G) => r(G.spindle)],
  [
    'Toe clearance (straight)',
    (G) => (G.clear < 0 ? <span className="warnTxt">{sgn(G.clear)} overlap</span> : r(G.clear)),
  ],
  [
    'Toe strike from',
    (_G, a) => (a == null ? 'none to 60°' : <span className="warnTxt">{a}° steer</span>),
  ],
  ['BB height', (G) => r(G.bbH)],
];

function columns({st, solved, GS, visible}: ReadoutProps): Col[] {
  const cols: Col[] = [];
  for (const id of visible) {
    const G = solved(id);
    const size = geometryOf(id).sizes[st.saved.bike[id].size]?.label ?? '';
    cols.push({id, G, label: `${bikeShort(id)} ${size}`, dot: colorOf(id).c, strike: strikeAngle(G)});
    if (GS && st.stage?.id === id) {
      cols.push({id, G: GS, label: `${bikeShort(id)} · staged`, dot: STAGED_COLOR.c, strike: strikeAngle(GS)});
    }
  }
  return cols;
}

function Readout(props: ReadoutProps & {part: 'warnings' | 'table'}) {
  const cols = columns(props);
  if (props.part === 'warnings') {
    const items: ReactNode[] = [];
    for (const col of cols) {
      const w = [...col.G.warns];
      if (col.G.clear < 0) w.push(`toe overlaps tyre by ${r(-col.G.clear)} mm`);
      if (col.strike != null) w.push(`toe strike from ${col.strike}° of steer`);
      w.forEach((t, i) =>
        items.push(
          <div className="warn-item" key={`${col.label}-${i}`}>
            <span className="dot" style={{background: colorOf(col.id).c}} />
            <b>{col.label}</b>
            <span>{t}</span>
          </div>,
        ),
      );
    }
    if (!items.length) return null;
    return (
      <div className="warnings">
        <span className="eyebrow">Warnings</span>
        {items}
      </div>
    );
  }
  if (!cols.length) {
    return (
      <table>
        <tbody>
          <tr>
            <td>Show a bike to see its numbers.</td>
          </tr>
        </tbody>
      </table>
    );
  }
  return (
    <table>
      <thead>
        <tr>
          <th>mm</th>
          {cols.map((c) => (
            <th key={c.label}>
              <span className="dot" style={{background: c.dot}} />
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {ROWS.map(([label, fn]) => (
          <tr key={label}>
            <td>{label}</td>
            {cols.map((c) => (
              <td key={c.label} className="num">
                {fn(c.G, c.strike)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
