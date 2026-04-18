import { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './userManagement.css';
import { supabase } from '../supabase';

// ── Confirm Delete Modal ─────────────────────────────────────
function ConfirmDeleteModal({ name, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={(e) => e.target.classList.contains('confirm-overlay') && onCancel()}>
      <div className="confirm-modal">
        <div className="confirm-modal-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h3 className="confirm-modal-title">Delete Faculty</h3>
        <p className="confirm-modal-msg">
          Are you sure you want to remove <strong>{name}</strong> from the system? This action cannot be undone.
        </p>
        <div className="confirm-modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Cancel</button>
          <button className="btn btn-confirm-delete" onClick={onConfirm}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Panel ───────────────────────────────────────────────
function EditPanel({ faculty, onClose, onSaved }) {
  const DEPARTMENTS = ['CCS', 'CEAS', 'CBA', 'BSA'];
  const RANKS       = ['Instructor I', 'Instructor II', 'Instructor III', 'Assistant Professor I', 'Assistant Professor II'];
  const NATURES     = ['Permanent', 'Temporary', 'Casual'];

  const [form, setForm] = useState({
    name:                    faculty?.name                    ?? '',
    email:                   faculty?.email                   ?? '',
    role:                    faculty?.role                    ?? 'faculty',
    department:              faculty?.department              ?? 'CCS',
    presentRank:             faculty?.presentRank             ?? 'Instructor I',
    natureOfAppointment:     faculty?.natureOfAppointment     ?? 'Permanent',
    currentSalary:           faculty?.currentSalary           ?? '',
    teachingExperienceYears: faculty?.teachingExperienceYears ?? '',
    industryExperienceYears: faculty?.industryExperienceYears ?? '',
    applyingFor:             faculty?.applyingFor             ?? 'Instructor I',
    lastPromotionDate:       faculty?.lastPromotionDate       ?? '',
    eligibility:             faculty?.eligibility             ?? '',
    educationalAttainment:   faculty?.educationalAttainment   ?? [],
    cycle_id:                faculty?.cycle_id                ?? '',
    status:                  faculty?.status                  ?? 'ranking',
  });
  const [newEdu, setNewEdu] = useState({ degree: '', school: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addEdu = () => {
    if (!newEdu.degree.trim()) return;
    set('educationalAttainment', [...form.educationalAttainment, { degree: newEdu.degree, school: newEdu.school }]);
    setNewEdu({ degree: '', school: '' });
  };
  const delEdu = (i) => set('educationalAttainment', form.educationalAttainment.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and Email are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (faculty?.id) {
        await updateDoc(doc(db, 'users', faculty.id), form);
      } else {
        await addDoc(collection(db, 'users'), form);
      }
      onSaved();
    } catch (err) {
      setError('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!faculty?.id) return;
    await deleteDoc(doc(db, 'users', faculty.id));
    onSaved();
  };

  return (
    <div className="panel-overlay open" onClick={(e) => e.target.classList.contains('panel-overlay') && onClose()}>
      <div className="panel">

        <div className="panel-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>{faculty?.id ? 'Edit Faculty' : 'Add Faculty'}</h3>
        </div>

        <div className="panel-body">

          {/* Personal Details + Educational Attainment */}
          <div className="panel-two-col">
            <div>
              <div className="panel-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Personal Details
              </div>
              <div className="field-group">
                <label>Name</label>
                <input className="field-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Last, First M." />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input className="field-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="faculty@gordoncollege.edu.ph" />
              </div>
              <div className="field-group">
                <label>Department</label>
                <div className="select-field">
                  <select value={form.department} onChange={e => set('department', e.target.value)}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Status</label>
                <div className="select-field">
                  <select value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="ranking">For Ranking</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="panel-section-title panel-section-title--row">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  Educational Attainment
                </span>
              </div>
              {form.educationalAttainment.map((e, i) => (
                <div key={i} className="edu-item">
                  <div><strong>{e.degree}</strong><small>{e.school}</small></div>
                  <button className="icon-del-btn" onClick={() => delEdu(i)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              ))}
              <div className="edu-add-row">
                <input className="field-input" placeholder="Degree" value={newEdu.degree} onChange={e => setNewEdu(n => ({ ...n, degree: e.target.value }))} />
                <input className="field-input" placeholder="School" value={newEdu.school} onChange={e => setNewEdu(n => ({ ...n, school: e.target.value }))} />
                <button className="icon-add-btn" onClick={addEdu}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
            </div>
          </div>

          {/* Employment Status + Eligibility */}
          <div className="panel-two-col">
            <div>
              <div className="panel-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                Employment Status
              </div>
              <div className="field-group">
                <label>Present Rank</label>
                <div className="select-field">
                  <select value={form.presentRank} onChange={e => set('presentRank', e.target.value)}>
                    {RANKS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Nature of Appointment</label>
                <div className="select-field">
                  <select value={form.natureOfAppointment} onChange={e => set('natureOfAppointment', e.target.value)}>
                    {NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Current Salary</label>
                <input className="field-input" placeholder="₱0.00" value={form.currentSalary} onChange={e => set('currentSalary', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="panel-section-title panel-section-title--row">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Eligibility
                </span>
              </div>
              <div className="field-group">
                <label>Civil Service Eligibility</label>
                <input className="field-input" value={form.eligibility} onChange={e => set('eligibility', e.target.value)} placeholder="e.g. PD 907" />
              </div>
            </div>
          </div>

          {/* Experience & Promotion */}
          <div className="panel-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Experience &amp; Promotion
          </div>
          <div className="panel-four-col" style={{ marginBottom: '20px' }}>
            <div className="field-group">
              <label>Teaching Exp. (yrs)</label>
              <input className="field-input" value={form.teachingExperienceYears} onChange={e => set('teachingExperienceYears', e.target.value)} placeholder="0" />
            </div>
            <div className="field-group">
              <label>Industry Exp. (yrs)</label>
              <input className="field-input" value={form.industryExperienceYears} onChange={e => set('industryExperienceYears', e.target.value)} placeholder="0" />
            </div>
            <div className="field-group">
              <label>Applying For</label>
              <div className="select-field">
                <select value={form.applyingFor} onChange={e => set('applyingFor', e.target.value)}>
                  {RANKS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label>Last Promotion Date</label>
              <input className="field-input" type="date" value={form.lastPromotionDate} onChange={e => set('lastPromotionDate', e.target.value)} />
            </div>
          </div>

          {error && <p className="panel-error">{error}</p>}

        </div>

        <div className="panel-footer">
          {faculty?.id && (
            <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          )}
          <button className="btn btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button className="btn btn-apply">Apply for Ranking</button>
        </div>
      </div>
    </div>
  );
}

// ── View Panel (Read-only) ──────────────────────────────────
function ViewPanel({ faculty, onClose }) {
  const DEPARTMENTS = ['CCS', 'CEAS', 'CBA', 'BSA'];
  const RANKS       = ['Instructor I', 'Instructor II', 'Instructor III', 'Assistant Professor I', 'Assistant Professor II'];
  const NATURES     = ['Permanent', 'Temporary', 'Casual'];

  const safe = (value, fallback = '') => (value == null ? fallback : value);
  const eduList = faculty?.educationalAttainment || [];

  return (
    <div className="panel-overlay open" onClick={(e) => e.target.classList.contains('panel-overlay') && onClose()}>
      <div className="panel">

        <div className="panel-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>Faculty Details</h3>
        </div>

        <div className="panel-body">

          {/* Personal Details + Educational Attainment */}
          <div className="panel-two-col">
            <div>
              <div className="panel-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Personal Details
              </div>
              <div className="field-group">
                <label>Name</label>
                <input className="field-input" value={safe(faculty?.name)} readOnly disabled />
              </div>
              <div className="field-group">
                <label>Email</label>
                <input className="field-input" type="email" value={safe(faculty?.email)} readOnly disabled />
              </div>
              <div className="field-group">
                <label>Department</label>
                <div className="select-field">
                  <select value={safe(faculty?.department, 'CCS')} disabled>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Status</label>
                <div className="select-field">
                  <select value={safe(faculty?.status === 'inactive' ? 'inactive' : 'ranking', 'ranking')} disabled>
                    <option value="ranking">For Ranking</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <div className="panel-section-title panel-section-title--row">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                  Educational Attainment
                </span>
              </div>
              {eduList.length === 0 && (
                <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>No educational records provided.</p>
              )}
              {eduList.map((e, i) => (
                <div key={i} className="edu-item">
                  <div><strong>{e.degree}</strong><small>{e.school}</small></div>
                </div>
              ))}
            </div>
          </div>

          {/* Employment Status + Eligibility */}
          <div className="panel-two-col">
            <div>
              <div className="panel-section-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                Employment Status
              </div>
              <div className="field-group">
                <label>Present Rank</label>
                <div className="select-field">
                  <select value={safe(faculty?.presentRank, 'Instructor I')} disabled>
                    {RANKS.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Nature of Appointment</label>
                <div className="select-field">
                  <select value={safe(faculty?.natureOfAppointment, 'Permanent')} disabled>
                    {NATURES.map(n => <option key={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-group">
                <label>Current Salary</label>
                <input className="field-input" value={safe(faculty?.currentSalary)} readOnly disabled />
              </div>
            </div>

            <div>
              <div className="panel-section-title panel-section-title--row">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Eligibility
                </span>
              </div>
              <div className="field-group">
                <label>Civil Service Eligibility</label>
                <input className="field-input" value={safe(faculty?.eligibility)} readOnly disabled placeholder="e.g. PD 907" />
              </div>
            </div>
          </div>

          {/* Experience & Promotion */}
          <div className="panel-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Experience &amp; Promotion
          </div>
          <div className="panel-four-col" style={{ marginBottom: '20px' }}>
            <div className="field-group">
              <label>Teaching Exp. (yrs)</label>
              <input className="field-input" value={safe(faculty?.teachingExperienceYears)} readOnly disabled placeholder="0" />
            </div>
            <div className="field-group">
              <label>Industry Exp. (yrs)</label>
              <input className="field-input" value={safe(faculty?.industryExperienceYears)} readOnly disabled placeholder="0" />
            </div>
            <div className="field-group">
              <label>Applying For</label>
              <div className="select-field">
                <select value={safe(faculty?.applyingFor, 'Instructor I')} disabled>
                  {RANKS.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="field-group">
              <label>Last Promotion Date</label>
              <input className="field-input" type="date" value={safe(faculty?.lastPromotionDate)} readOnly disabled />
            </div>
          </div>

        </div>

        <div className="panel-footer">
          <button className="btn btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Faculty Row ──────────────────────────────────────────────
function FacultyRow({ faculty, departments, onView, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const departmentMatch = (departments || []).find((d) => {
    if (!d) return false;
    const depId = d.department_id;
    return String(depId) === String(faculty.department);
  });
  const departmentLabel = departmentMatch?.department_name || faculty.department || '';

  return (
    <>
      <tr>
        <td className="faculty-name">{faculty.name}</td>
        <td className="faculty-email">{faculty.email}</td>
        <td>{departmentLabel}</td>
        <td>{faculty.presentRank}</td>
        <td>
          <span className={`badge ${faculty.status === 'ranking' ? 'badge-ranking' : 'badge-inactive'}`}>
            {faculty.status === 'ranking' ? 'For Ranking' : 'Inactive'}
          </span>
        </td>
        <td>{faculty.createdAt}</td>
        <td>
          <div className="row-actions">
            <button className="action-btn" onClick={() => onView(faculty)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button className="action-btn action-btn--delete" onClick={() => setShowConfirm(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4h6v2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
      {showConfirm && (
        <ConfirmDeleteModal
          name={faculty.name}
          onConfirm={() => { setShowConfirm(false); onDelete(); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}

// ── Invite Faculty Modal ────────────────────────────────────
function InviteFacultyModal({ form, status, loading, onChange, onSubmit, onClose }) {
  return (
    <div className="confirm-overlay" onClick={(e) => e.target.classList.contains('confirm-overlay') && onClose()}>
      <div className="confirm-modal" style={{ alignItems: 'stretch' }}>
        <h3 className="confirm-modal-title" style={{ textAlign: 'left' }}>Invite Faculty</h3>
        <p className="confirm-modal-msg" style={{ textAlign: 'left', marginBottom: '12px' }}>
          This will send an email invitation via Supabase Auth and create a matching record in the <code>public.users</code> table.
          The faculty member will set their own password using the link in the email.
        </p>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="field-group">
            <label>First Name</label>
            <input
              className="field-input"
              type="text"
              value={form.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              placeholder="Juan"
            />
          </div>
          <div className="field-group">
            <label>Last Name</label>
            <input
              className="field-input"
              type="text"
              value={form.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              placeholder="Dela Cruz"
            />
          </div>
          <div className="field-group">
            <label>Faculty Email (domain_email)</label>
            <input
              className="field-input"
              type="email"
              value={form.email}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="faculty@gordoncollege.edu.ph"
            />
          </div>
          {status && (
            <p className="panel-error" style={{ marginTop: '4px' }}>{status}</p>
          )}
          <div className="confirm-modal-actions" style={{ marginTop: '12px' }}>
            <button type="button" className="btn btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-apply" disabled={loading}>
              {loading ? 'Sending…' : 'Send Invitation'}
            </button>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '4px' }}>
            The invite email contains a secure link where the faculty member can set their own password.
          </p>
        </form>
      </div>
    </div>
  );
}

// ── User Management Page ─────────────────────────────────────
export default function UserManagement() {
  const [selected, setSelected]         = useState(null);
  const [addingNew, setAddingNew]       = useState(false);
  const [viewing, setViewing]           = useState(null);
  const [search, setSearch]             = useState('');
  const [deptFilter, setDeptFilter]     = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [showInvite, setShowInvite]     = useState(false);
  const [inviteForm, setInviteForm]     = useState({ firstName: '', lastName: '', email: '' });
  const [inviteStatus, setInviteStatus] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [loadError, setLoadError]       = useState('');
  const [departments, setDepartments]   = useState([]);
  const [facultyList, setFacultyList]   = useState([
    { id: 'f1', name: 'faculty_name_1', email: 'faculty_email_1', department: 'faculty_dept_1', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f2', name: 'faculty_name_2', email: 'faculty_email_2', department: 'faculty_dept_2', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f3', name: 'faculty_name_3', email: 'faculty_email_3', department: 'faculty_dept_3', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f4', name: 'faculty_name_4', email: 'faculty_email_4', department: 'faculty_dept_4', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f5', name: 'faculty_name_5', email: 'faculty_email_5', department: 'faculty_dept_5', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f6', name: 'faculty_name_6', email: 'faculty_email_6', department: 'faculty_dept_6', presentRank: 'Instructor I', status: 'ranking' },
    { id: 'f7', name: 'faculty_name_7', email: 'faculty_email_7', department: 'faculty_dept_7', presentRank: 'Instructor I', status: 'inactive' },
    { id: 'f8', name: 'faculty_name_8', email: 'faculty_email_8', department: 'faculty_dept_8', presentRank: 'Instructor I', status: 'ranking' },
  ]);

  const fetchFaculty = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await fetch('http://localhost:5000/users');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load faculty users');
      }

      const mapped = (data || [])
        .filter((u) => u.domain_email !== 'admin@gordoncollege.edu.ph')
        .map((u) => ({
        id: u.user_id,
        name: `${u.name_last}, ${u.name_first}`,
        email: u.domain_email,
        department: u.department_id ?? '',
        presentRank: u.current_rank ?? '',
        status: u.status === 'inactive' ? 'inactive' : 'ranking',
        createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
      }));

      setFacultyList(mapped);
    } catch (err) {
      setLoadError(err.message || 'Failed to load faculty users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:5000/departments');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load departments');
      }
      setDepartments(data || []);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAddFaculty = () => {
    const newId = `f${facultyList.length + 1}`;
    setFacultyList([
      ...facultyList,
      {
        id: newId,
        name: `faculty_name_${newId}`,
        email: `faculty_email_${newId}`,
        department: 'faculty_dept_new',
        presentRank: 'Instructor I',
        status: 'ranking',
        createdAt: new Date().toLocaleDateString(),
      },
    ]);
  };

  const handleSaved = () => {
    setSelected(null);
    setAddingNew(false);
  };

  const handleInviteChange = (field, value) => {
    setInviteForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setInviteStatus('');

    if (!inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.email.trim()) {
      setInviteStatus('First name, last name, and email are required.');
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch('http://localhost:5000/invite-faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email.trim(),
          name_first: inviteForm.firstName.trim(),
          name_last: inviteForm.lastName.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteStatus(data.message || 'Invitation email sent successfully.');
      setInviteForm({ firstName: '', lastName: '', email: '' });
      // keep modal open so admin can read the status
      fetchFaculty();
    } catch (err) {
      setInviteStatus(err.message || 'Error sending invite');
    } finally {
      setInviteLoading(false);
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="content">
          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="toolbar-label">Faculty Users</span>
              <div className="search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  type="text"
                  placeholder="Search faculty name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="filter-wrap">
                <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
                  <option value="All Departments">All Departments</option>
                  {departments.map((d) => (
                    <option
                      key={d.department_id}
                      value={String(d.department_id)}
                    >
                      {d.department_code || d.department_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="filter-wrap">
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option>All Status</option>
                  <option>For Ranking</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <button className="btn btn-add" onClick={() => setShowInvite(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Invite Faculty
            </button>
          </div>

          {loadError && (
            <p className="panel-error" style={{ marginTop: '8px' }}>{loadError}</p>
          )}

          {/* Table */}
          {loading ? (
            <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#6b7280' }}>Loading faculty users…</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Current Rank</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {facultyList.map((faculty) => (
                  <FacultyRow
                    key={faculty.id}
                    faculty={faculty}
                    departments={departments}
                    onView={(f) => { setViewing(f); setSelected(null); }}
                    onEdit={(f) => setSelected(f)}
                    onDelete={() => setFacultyList(prev => prev.filter(f => f.id !== faculty.id))}
                  />
                ))}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {viewing && (
        <ViewPanel
          faculty={viewing}
          onClose={() => setViewing(null)}
        />
      )}
      {(selected || addingNew) && (
        <EditPanel
          faculty={selected}
          onClose={() => { setSelected(null); setAddingNew(false); }}
          onSaved={handleSaved}
        />
      )}
      {showInvite && (
        <InviteFacultyModal
          form={inviteForm}
          status={inviteStatus}
          loading={inviteLoading}
          onChange={handleInviteChange}
          onSubmit={handleInviteSubmit}
          onClose={() => { setShowInvite(false); setInviteStatus(''); }}
        />
      )}
    </div>
  );
}