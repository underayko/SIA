import { useState } from 'react';
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

// ── Faculty Row ──────────────────────────────────────────────
function FacultyRow({ faculty, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <tr>
        <td className="faculty-name">{faculty.name}</td>
        <td className="faculty-email">{faculty.email}</td>
        <td>{faculty.department}</td>
        <td>{faculty.presentRank}</td>
        <td>
          <span className={`badge ${faculty.status === 'ranking' ? 'badge-ranking' : 'badge-inactive'}`}>
            {faculty.status === 'ranking' ? 'For Ranking' : 'Inactive'}
          </span>
        </td>
        <td>{faculty.createdAt}</td>
        <td>
          <div className="row-actions">
            <button className="action-btn action-btn--edit" onClick={() => onEdit(faculty)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
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

// ── User Management Page ─────────────────────────────────────
export default function UserManagement() {
  const [selected, setSelected]         = useState(null);
  const [addingNew, setAddingNew]       = useState(false);
  const [search, setSearch]             = useState('');
  const [deptFilter, setDeptFilter]     = useState('All Departments');
  const [statusFilter, setStatusFilter] = useState('All Status');
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

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="content">

          <div className="rk-card-header">
            <span className="rk-card-title">User Management</span>
            <span className="rk-semester">1st Semester AY 2026–2027</span>
          </div>

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
                  <option>All Departments</option>
                  <option>CEAS</option>
                  <option>CCS</option>
                  <option>CBA</option>
                  <option>BSA</option>
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
            <button className="btn btn-add" onClick={handleAddFaculty}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Faculty
            </button>
          </div>

          {/* Table */}
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
                  onEdit={(f) => setSelected(f)}
                  onDelete={() => setFacultyList(prev => prev.filter(f => f.id !== faculty.id))}
                />
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {(selected || addingNew) && (
        <EditPanel
          faculty={selected}
          onClose={() => { setSelected(null); setAddingNew(false); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}