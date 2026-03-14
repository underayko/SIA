import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../global.css';

// ── Sidebar ─────────────────────────────────────────────────
function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-seal">
          <svg viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="26" cy="26" r="24" fill="#1a5c30"/>
            <circle cx="26" cy="26" r="20" fill="none" stroke="#fff" strokeWidth="1"/>
            <text x="26" y="22" textAnchor="middle" fill="#fff" fontSize="5.5" fontFamily="serif" fontWeight="bold">GORDON</text>
            <text x="26" y="29" textAnchor="middle" fill="#ffd700" fontSize="4.5" fontFamily="serif">COLLEGE</text>
            <text x="26" y="36" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="3.5" fontFamily="serif">OLONGAPO CITY</text>
          </svg>
        </div>
        <h1>Gordon College</h1>
        <span>HR Admin Portal</span>
      </div>

      <nav className="nav">
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          Dashboard
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          Ranking Areas
        </NavLink>
        <NavLink to="/review" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Review &amp; Score
        </NavLink>
        <NavLink to="/usermanagement" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
          User Management
        </NavLink>
        <NavLink to="/submission" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>
          Submission Settings
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <strong>Dr. Maria Santos</strong>
          <small>HR Director</small>
        </div>
        <button className="logout-btn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Logout
        </button>
      </div>
    </aside>
  );
}

// ── Cycle Card ───────────────────────────────────────────────
function CycleCard({ onEdit }) {
  return (
    <div className="cycle-card">
      <div className="cycle-header">
        <div>
          <div className="cycle-label">Current Cycle</div>
          <div className="cycle-title">1st Semester AY 2026–2027</div>
          <div className="cycle-meta">
            Started: Feb 1, 2026<br />
            Deadline: March 15, 2026
          </div>
        </div>
        <span className="badge badge-closed">Closed</span>
      </div>
      <div className="cycle-footer">
        <span className="badge badge-progress">In Progress</span>
        <div className="btn-group">
          <button className="btn btn-edit" onClick={onEdit}>Edit</button>
          <button className="btn btn-open">Open Submission</button>
        </div>
      </div>
    </div>
  );
}

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ iconClass, icon, label, value }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}

// ── History Item ─────────────────────────────────────────────
function HistoryItem({ status, title, startedDate, endDate, endLabel }) {
  return (
    <div className="history-item">
      <div className="history-badge">{status}</div>
      <div className="history-title">{title}</div>
      <div className="history-meta">
        Started: {startedDate}<br />
        {endLabel}: {endDate}
      </div>
      <div className="history-footer">
        <span className="badge badge-published">Published</span>
      </div>
    </div>
  );
}

// ── Timeline Modal ───────────────────────────────────────────
function TimelineModal({ onClose }) {
  return (
    <div
      className="modal-overlay open"
      onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}
    >
      <div className="modal">
        <h3>Timeline Configuration</h3>

        <div className="modal-grid">
          <div className="modal-field">
            <label>Academic Year</label>
            <div className="year-range">
              <input type="number" defaultValue="2025" />
              <span>—</span>
              <input type="number" defaultValue="2026" />
            </div>
          </div>
          <div className="modal-field">
            <label>Semester</label>
            <select defaultValue="1st Semester">
              <option>1st Semester</option>
              <option>2nd Semester</option>
            </select>
          </div>
        </div>

        <div className="modal-grid">
          <div className="modal-field">
            <label>Submission Start Date</label>
            <input type="date" defaultValue="2026-01-09" />
          </div>
          <div className="modal-field">
            <label>Submission Deadline</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="date" defaultValue="2026-06-20" style={{ flex: 1 }} />
              <input type="time" defaultValue="23:59" style={{ width: '90px' }} />
            </div>
          </div>
        </div>

        <div className="modal-section-title">Current Settings Summary</div>
        <div className="summary-box">
          <div className="summary-row">
            <div>
              <label>Academic Year</label>
              <span style={{ display: 'block', marginTop: '2px' }}>2025-2026</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <label>Status</label>
              <span className="inactive" style={{ display: 'block', marginTop: '2px' }}>
                Inactive (Closed Submissions)
              </span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-save" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────
export default function Dashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  const stats = [
    {
      iconClass: 'blue',
      label: 'Total Faculty',
      value: '128',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
        </svg>
      ),
    },
    {
      iconClass: 'amber',
      label: 'Pending Reviews',
      value: '34',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
    },
    {
      iconClass: 'green',
      label: 'Completed',
      value: '89',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
          <polyline points="9 11 12 14 22 4"/>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
        </svg>
      ),
    },
    {
      iconClass: 'red',
      label: 'Deadline',
      value: 'Mar 15',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
  ];

  const history = [
    { status: 'Completed', title: '2nd Semester AY 2025–2026', startedDate: 'Aug 1, 2025', endDate: 'Oct 10, 2025', endLabel: 'Published' },
    { status: 'Completed', title: '1st Semester AY 2025–2026', startedDate: 'Feb 1, 2025', endDate: 'Apr 5, 2025', endLabel: 'Published' },
  ];

  return (
    <div className="app">
      <Sidebar />

      <div className="main">

        <div className="content">
          <div className="page-title">Dashboard Overview</div>

          <CycleCard onEdit={() => setModalOpen(true)} />

          <div className="stats-grid">
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>

          <div className="history-card">
            <div className="history-header">
              <div>
                <h3>Ranking Cycle History</h3>
                <p>All cycles you have participated in or that are currently open</p>
              </div>
              <span className="history-count">3 Cycles</span>
            </div>
            <div className="history-grid">
              {history.map((h) => (
                <HistoryItem key={h.title} {...h} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && <TimelineModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}