import {NavLink} from 'react-router';

// Brand, route switcher and page title. Rendered at the top of the sidebar,
// and again at the top of main on narrow screens where the sidebar moves below.
export function AppHeader({title, sub}: {title: [string, string]; sub?: string}) {
  return (
    <header>
      <div className="brand">
        <span className="eyebrow">Bike Calc</span>
        <nav className="seg nav" aria-label="Tools">
          <NavLink to="/" end>
            Gears
          </NavLink>
          <NavLink to="/fit">Fit</NavLink>
        </nav>
      </div>
      <h1>
        {title[0]}
        <br /> {title[1]}
      </h1>
      {sub && <p className="sub">{sub}</p>}
    </header>
  );
}

export function MobileHeader(props: {title: [string, string]; sub?: string}) {
  return (
    <div className="mobile-head">
      <AppHeader {...props} />
    </div>
  );
}
