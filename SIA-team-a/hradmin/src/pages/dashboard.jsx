import { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './dashboard.css';
import { supabase } from '../supabase';


// ── Cycle Card ───────────────────────────────────────────────
function CycleCard({ cycle, onEdit, onCycleAction }) {
  if (!cycle) {
    return (
      <div className="cycle-card">
        <div className="cycle-header">
          <div>
            <div className="cycle-label">No Active Cycle</div>
            <div className="cycle-title">Create your first evaluation cycle</div>
          </div>
          <span className="badge badge-inactive">Not Started</span>
        </div>
        <div className="cycle-footer">
          <div className="btn-group">
            <button className="btn btn-edit" onClick={onEdit}>Create Cycle</button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    // Handle both Timestamp objects and date strings
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    // Use the cycle's status field first, then fall back to date logic
    if (cycle.status === 'closed') {
      return { class: 'badge-closed', text: 'Closed' };
    }

    if (cycle.status === 'open') {
      // For open cycles, check if they've actually started based on dates
      const now = new Date();
      const start = cycle.start_date?.toDate ? cycle.start_date.toDate() : new Date(cycle.start_date);
      const end = cycle.deadline?.toDate ? cycle.deadline.toDate() : new Date(cycle.deadline);

      // Compare dates only (ignore time) for start date check
      const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      
      if (nowDate < startDate) {
        return { class: 'badge-inactive', text: 'Not Started' };
      }
      if (now > end) {
        return { class: 'badge-warning', text: 'Overdue' };
      }
      return { class: 'badge-progress', text: 'In Progress' };
    }
    
    // Default fallback
    return { class: 'badge-inactive', text: 'Unknown Status' };
  };

  const getActionButtons = () => {
    const isOpen = cycle.status === 'open';

    if (isOpen) {
      // Active cycle: Edit + Close Cycle
      return (
        <>
          <button className="btn btn-edit" onClick={onEdit}>Edit</button>
          <button className="btn btn-close" onClick={() => onCycleAction('close')}>Close Cycle</button>
        </>
      );
    } else {
      // Closed cycle: Edit + Open Cycle
      return (
        <>
          <button className="btn btn-edit" onClick={onEdit}>Edit</button>
          <button className="btn btn-open" onClick={() => onCycleAction('open')}>Open Cycle</button>
        </>
      );
    }
  };

  const status = getStatusBadge();

  return (
    <div className="cycle-card">
      <div className="cycle-header">
        <div>
          <div className="cycle-label">Current Cycle</div>
          <div className="cycle-title">{cycle.title}</div>
          <div className="cycle-meta">
            Started: {formatDate(cycle.start_date)}<br />
            Deadline: {formatDate(cycle.deadline)}
          </div>
        </div>
        <span className={`badge ${status.class}`}>{status.text}</span>
      </div>
      <div className="cycle-footer">
        <span className={`badge ${status.class}`}>{status.text}</span>
        <div className="btn-group">
          {getActionButtons()}
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
function HistoryItem({ cycle }) {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not set';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  const getStatus = () => {
    return cycle.status === 'open' ? 'Active' : 'Completed';
  };

  return (
    <div className="history-item">
      <div className="history-badge">{getStatus()}</div>
      <div className="history-title">{cycle.title}</div>
      <div className="history-meta">
        Started: {formatDate(cycle.start_date)}<br />
        Deadline: {formatDate(cycle.deadline)}
      </div>
      <div className="history-footer">
        <span className="badge badge-published">Published</span>
      </div>
    </div>
  );
}

// ── Timeline Modal ───────────────────────────────────────────
function TimelineModal({ cycle, onClose, onSaved }) {
  const [form, setForm] = useState({
    title:       cycle?.title       || '',
    year:        cycle?.year        || new Date().getFullYear(),
    semester:    cycle?.semester    || 'First Semester',
    start_date:  cycle?.start_date  ? (cycle.start_date.toDate ? cycle.start_date.toDate().toISOString().split('T')[0] : cycle.start_date) : '',
    deadline:    cycle?.deadline    ? (cycle.deadline.toDate ? cycle.deadline.toDate().toISOString().split('T')[0] : cycle.deadline) : '',
    deadline_time: '23:59',
    status:      cycle?.status      || 'open',
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  // Utility function to remove undefined values from object
  const cleanData = (data) => {
    const cleaned = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const generateTitle = () => {
    return `${form.semester} ${form.year}`;
  };

  const handleSave = async () => {
    const title = form.title || generateTitle();
    // Use ISO strings for Supabase
    const startTimestamp = form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString();
    const deadlineTimestamp = form.deadline ? new Date(form.deadline + 'T' + form.deadline_time).toISOString() : new Date().toISOString();

    // Get the current logged-in user
    const {
      data: { user: sessionUser },
      error: userError
    } = await supabase.auth.getUser();
    if (userError || !sessionUser) {
      alert('Could not get current user. Please log in again.');
      return;
    }

    // Fetch the user's row from the users table to get the integer id
    let userId;
    let userRows, userRowError;
    ({ data: userRows, error: userRowError } = await supabase
      .from('users')
      .select('user_id')
      .eq('domain_email', sessionUser.email)
      .limit(1));
    if (!userRowError && userRows && userRows.length > 0) {
      userId = userRows[0].user_id;
    } else {
      // If not found, create a new profile row for this user
      const { data: inserted, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            name_last: 'Admin',
            name_first: 'System',
            domain_email: sessionUser.email,
            password_hash: 'supabase-auth',
            role: 'HR',
            created_at: new Date().toISOString(),
          }
        ])
        .select('user_id');
      if (insertError || !inserted || inserted.length === 0) {
        alert('Could not create user profile in database.');
        return;
      }
      userId = inserted[0].user_id;
    }

    const cycleData = {
      title,
      year: Number(form.year),
      semester: form.semester,
      start_date: startTimestamp,
      deadline: deadlineTimestamp,
      status: form.status,
      created_by: userId, // Use integer user_id
    };

    // Add timestamps
    if (cycle?.cycle_id) {
      // Updating existing cycle - preserve created_at or set it if missing
      cycleData.created_at = cycle.created_at || new Date().toISOString();
    } else {
      // New cycle
      cycleData.created_at = new Date().toISOString();
    }

    // Clean undefined values from the data
    const cleanedData = cleanData(cycleData);

    setSaving(true);
    try {
      // Validate that all required fields are defined
      const requiredFields = ['title', 'year', 'semester', 'start_date', 'deadline', 'status', 'created_at', 'created_by'];
      const missingFields = requiredFields.filter(field =>
        cleanedData[field] === undefined || cleanedData[field] === null
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      console.log('💾 Saving cycle data:', cleanedData);
      
      if (cycle?.id) {
        // Update cycle in Supabase
        const { error } = await supabase
          .from('ranking_cycles')
          .update(cleanedData)
          .eq('cycle_id', cycle.cycle_id);
        if (error) throw error;
        console.log('✅ Cycle updated successfully');
      } else {
        // Insert new cycle in Supabase
        const { data, error } = await supabase
          .from('ranking_cycles')
          .insert([cleanedData]);
        if (error) throw error;
        console.log('✅ New cycle created:', data);
      }
      onSaved();
    } catch (err) {
      console.error('❌ Error saving cycle:', err);
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay open" onClick={(e) => e.target.classList.contains('modal-overlay') && onClose()}>
      <div className="modal">
        <h3>{cycle?.id ? 'Edit Cycle' : 'Create New Cycle'}</h3>
        <div className="modal-grid">
          <div className="modal-field">
            <label>Academic Year</label>
            <input
              type="number"
              value={form.year}
              onChange={e => set('year', Number(e.target.value))}
            />
          </div>
          <div className="modal-field">
            <label>Semester</label>
            <select value={form.semester} onChange={e => set('semester', e.target.value)}>
              <option>First Semester</option>
              <option>Second Semester</option>
            </select>
          </div>
        </div>
        <div className="modal-grid">
          <div className="modal-field">
            <label>Cycle Title</label>
            <input
              type="text"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder={generateTitle()}
            />
          </div>
          <div className="modal-field">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="open">Open</option>
              <option value="close">Closed</option>
            </select>
          </div>
        </div>
        <div className="modal-grid">
          <div className="modal-field">
            <label>Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={e => set('start_date', e.target.value)}
            />
          </div>
          <div className="modal-field">
            <label>Deadline</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="date" 
                value={form.deadline} 
                onChange={e => set('deadline', e.target.value)}
                style={{ flex: 1 }} 
              />
              <input 
                type="time" 
                value={form.deadline_time} 
                onChange={e => set('deadline_time', e.target.value)}
                style={{ width: '90px' }} 
              />
            </div>
          </div>
        </div>
        <div className="modal-section-title">Preview</div>
        <div className="summary-box">
          <div className="summary-row">
            <div>
              <label>Cycle Title</label>
              <span style={{ display: 'block', marginTop: '2px' }}>{form.title || generateTitle()}</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <label>Status</label>
              <span className={form.status} style={{ display: 'block', marginTop: '2px' }}>
                {form.status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-save" onClick={handleSave} disabled={saving}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard Page ───────────────────────────────────────────
export default function Dashboard() {
  const [currentCycle, setCurrentCycle] = useState(null);
  const [cycleHistory, setCycleHistory] = useState([]);
  const [stats, setStats] = useState({
    totalFaculty: 0,
    pendingReviews: 0,
    completed: 0,
    deadline: 'Not set'
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('🔄 Starting data fetch (Supabase)...');

      // Fetch all cycles
      const { data: allCycles, error: cyclesError } = await supabase
        .from('ranking_cycles')
        .select('*');
      if (cyclesError) throw cyclesError;
      console.log('All cycles found:', allCycles);

      // Find the open cycle
      const openCycle = allCycles.find(c => c.status === 'open');
      if (openCycle) {
        setCurrentCycle(openCycle);
      } else {
        setCurrentCycle(null);
      }

      // History: closed cycles, sorted by created_at desc
      const history = allCycles
        .filter(c => c.status !== 'open')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10);
      setCycleHistory(history);

      // Faculty stats
      const { count: facultyUsersCount, error: usersError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'faculty');
      if (usersError) throw usersError;

      // If you do not have a separate 'faculty' table, use 'users' for both counts
      const facultyRecordsCount = facultyUsersCount;

      // Applications for current cycle
      let pendingCount = 0;
      let completedCount = 0;
      if (openCycle) {
        if (openCycle.cycle_id !== undefined && openCycle.cycle_id !== null) {
          const { data: applications, error: appsError } = await supabase
            .from('applications')
            .select('*')
            .eq('cycle_id', openCycle.cycle_id);
          if (appsError) throw appsError;
          applications.forEach(app => {
            if (app.status === 'Under_HR_Review' || app.status === 'Submitted') {
              pendingCount++;
            } else {
              completedCount++;
            }
          });
        }
      }

      // Calculate stats
      const deadline = openCycle?.deadline ?
        new Date(openCycle.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
        'Not set';

      const totalFaculty = Math.max(facultyUsersCount || 0, facultyRecordsCount || 0);

      setStats({
        totalFaculty,
        pendingReviews: pendingCount,
        completed: completedCount,
        deadline
      });

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setCurrentCycle(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
  }, []);

  const handleCycleSaved = () => {
    setModalOpen(false);
    // Always refresh dashboard after saving a cycle
    fetchData();
  };

  const handleCycleAction = async (action) => {
    if (!currentCycle) return;
    try {
      // Only allow 'open' or 'close' (all lowercase)
      const newStatus = action === 'open' ? 'open' : 'closed';
      if (newStatus !== 'open' && newStatus !== 'closed') {
        alert('Invalid status value. Allowed: open, close');
        return;
      }
      console.log(`🔄 Updating cycle ${currentCycle.cycle_id} status to: ${newStatus}`);
      const { error } = await supabase
        .from('ranking_cycles')
        .update({ status: newStatus })
        .eq('cycle_id', currentCycle.cycle_id);
      if (error) throw error;
      console.log('✅ Cycle status updated successfully');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('❌ Error updating cycle status:', err);
      alert('Failed to update cycle status: ' + err.message);
    }
  };

  const statCards = [
    {
      iconClass: 'blue', label: 'Total Faculty', value: stats.totalFaculty.toString(),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
    },
    {
      iconClass: 'amber', label: 'Pending Reviews', value: stats.pendingReviews.toString(),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    },
    {
      iconClass: 'green', label: 'Completed', value: stats.completed.toString(),
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
    },
    {
      iconClass: 'red', label: 'Deadline', value: stats.deadline,
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
  ];

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="content">
            <div className="page-title">Dashboard Overview</div>
            <p style={{ padding: '24px', color: '#6b7280' }}>Loading dashboard data…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="content">
          <div className="page-title">Dashboard Overview</div>

          <CycleCard 
            cycle={currentCycle} 
            onEdit={() => setModalOpen(true)} 
            onCycleAction={handleCycleAction}
          />

          <div className="stats-grid">
            {statCards.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="history-card">
            <div className="history-header">
              <div>
                <h3>Ranking Cycle History</h3>
                <p>All previous evaluation cycles</p>
              </div>
              <span className="history-count">{cycleHistory.length} Cycles</span>
            </div>
            <div className="history-grid">
              {cycleHistory.length === 0 ? (
                <p style={{ padding: '24px', color: '#6b7280', textAlign: 'center' }}>
                  No previous cycles found.
                </p>
              ) : (
                cycleHistory.map((cycle) => <HistoryItem key={cycle.id} cycle={cycle} />)
              )}
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <TimelineModal 
          cycle={currentCycle} 
          onClose={() => setModalOpen(false)} 
          onSaved={handleCycleSaved}
        />
      )}
    </div>
  );
}