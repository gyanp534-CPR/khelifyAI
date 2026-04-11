import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../../services/store';
import { useLiveMatches } from '../../hooks/useData';
import './Navbar.css';

export default function Navbar() {
  const { toggleSidebar } = useAppStore();
  const { data: matches = [] } = useLiveMatches();
  const liveCount = matches.filter(m => {
    const s = (m.status || '').toLowerCase();
    return s.includes('live') || s.includes('innings') || s.includes('over');
  }).length;

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="nav-hamburger" onClick={toggleSidebar} aria-label="Menu">
          <span /><span /><span />
        </button>
        <Link to="/" className="nav-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">KHELIFY</span>
          <span className="logo-sub">.ai</span>
        </Link>
        {liveCount > 0 && (
          <div className="live-pill">
            <span className="live-dot" />
            {liveCount} LIVE
          </div>
        )}
      </div>

      <div className="nav-links">
        <NavLink to="/">Live</NavLink>
        <NavLink to="/series">Series</NavLink>
        <NavLink to="/players">Players</NavLink>
      </div>

      <div className="nav-right">
        <div className="nav-refresh-hint">Auto-refresh 60s</div>
      </div>
    </nav>
  );
}

function NavLink({ to, children }) {
  const { pathname } = useLocation();
  const active = pathname === to || (to !== '/' && pathname.startsWith(to));
  return (
    <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>
      {children}
    </Link>
  );
}
