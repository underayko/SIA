import { NavLink } from 'react-router-dom';

// NOTE: No CSS import here.
// The page that uses <Sidebar /> is responsible for importing
// the CSS that contains the sidebar styles (e.g. Dashboard.css).

const GordonSeal = () => (
  <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="26" cy="26" r="24" fill="#1a5c30"/>
    <circle cx="26" cy="26" r="20" fill="none" stroke="#fff" strokeWidth="1"/>
    <text x="26" y="22" textAnchor="middle" fill="#fff" fontSize="5.5" fontFamily="serif" fontWeight="bold">GORDON</text>
    <text x="26" y="29" textAnchor="middle" fill="#ffd700" fontSize="4.5" fontFamily="serif">COLLEGE</text>
    <text x="26" y="36" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="3.5" fontFamily="serif">OLONGAPO CITY</text>
  </svg>
);

const navLinks = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/ranking',
    label: 'Ranking Areas',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    to: '/review',
    label: 'Review & Score',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    to: '/usermanagement',
    label: 'User Management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    to: '/submission',
    label: 'Submission Settings',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
      </svg>
    ),
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-seal">
          <GordonSeal />
        </div>
        <h1>Gordon College</h1>
        <span>HR Admin Portal</span>
      </div>

      <nav className="nav">
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <strong>Dr. Maria Santos</strong>
          <small>HR Director</small>
        </div>
        <button className="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Logout
        </button>
      </div>
    </aside>
  );
}