import { useState } from 'react';
import Sidebar from '../components/sidenav';
import './userManagement.css';

// ── Edit Panel ───────────────────────────────────────────────
function EditPanel({ onClose }) {
  return (
    <div className="panel-overlay open" onClick={(e) => e.target.classList.contains('panel-overlay') && onClose()}>
      <div className="panel">

        <div className="panel-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          <h3>Faculty Information</h3>
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
                <div className="field-value">Jenkins, Sarah A.</div>
              </div>
              <div className="field-group">
                <label>Department</label>
                <div className="select-field">
                  <select defaultValue="CCS">
                    <option>CCS</option><option>CEAS</option><option>CBA</option><option>BSA</option>
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
                <button className="icon-add-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div className="edu-item">
                <div><strong>Bachelor's in Computer Science</strong><small>State University</small></div>
                <button className="icon-del-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
              </div>
              <div className="edu-item">
                <div><strong>Master's in Computer Science</strong><small>Tech Institute</small></div>
                <button className="icon-del-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
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
                  <select defaultValue="Instructor II"><option>Instructor II</option><option>Instructor I</option><option>Instructor III</option></select>
                </div>
              </div>
              <div className="field-group">
                <label>Nature of Appointment</label>
                <div className="select-field">
                  <select defaultValue="Permanent"><option>Permanent</option><option>Temporary</option><option>Casual</option></select>
                </div>
              </div>
              <div className="field-group">
                <label>Current Salary</label>
                <div className="field-value">₱45,000.00</div>
              </div>
            </div>

            <div>
              <div className="panel-section-title panel-section-title--row">
                <span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Eligibility &amp; Exams
                </span>
                <button className="icon-add-btn">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
              </div>
              <div className="edu-item">
                <span>Civil Service Professional</span>
                <button className="icon-del-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
              </div>
            </div>
          </div>

          {/* Experience & Rating */}
          <div className="panel-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Experience &amp; Rating
          </div>
          <div className="panel-four-col" style={{ marginBottom: '20px' }}>
            <div className="field-group">
              <label>Teaching Exp.</label>
              <div className="select-field"><select defaultValue="8 years"><option>8 years</option><option>5 years</option><option>10 years</option></select></div>
            </div>
            <div className="field-group">
              <label>Industry Exp.</label>
              <div className="select-field"><select defaultValue="3 years"><option>3 years</option><option>1 year</option><option>5 years</option></select></div>
            </div>
            <div className="field-group">
              <label>Performance Rating</label>
              <div className="field-value">4.8</div>
            </div>
            <div className="field-group">
              <label>Rating Description</label>
              <div className="field-value">Very Satisfactory</div>
            </div>
          </div>

          {/* Application Details */}
          <div className="panel-section-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Application Details
          </div>
          <div className="panel-two-col">
            <div className="field-group">
              <label>Applying For</label>
              <div className="select-field"><select defaultValue="Instructor III"><option>Instructor III</option><option>Assistant Professor I</option></select></div>
            </div>
            <div className="field-group">
              <label>Last Promotion</label>
              <div className="field-value">Jan 26, 2025</div>
            </div>
          </div>

        </div>

        <div className="panel-footer">
          <button className="btn btn-save">Save</button>
          <button className="btn btn-apply">Apply for Ranking</button>
        </div>
      </div>
    </div>
  );
}

// ── Faculty Row ──────────────────────────────────────────────
function FacultyRow({ faculty, onEdit }) {
  return (
    <tr>
      <td className="faculty-name">{faculty.name}</td>
      <td className="faculty-email">{faculty.email}</td>
      <td>{faculty.department}</td>
      <td>{faculty.rank}</td>
      <td>
        <span className={`badge ${faculty.status === 'ranking' ? 'badge-ranking' : 'badge-inactive'}`}>
          {faculty.status === 'ranking' ? 'For Ranking' : 'Inactive'}
        </span>
      </td>
      <td>
        <button className="edit-btn" onClick={onEdit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
      </td>
    </tr>
  );
}

// ── User Management Page ─────────────────────────────────────
export default function UserManagement() {
  const [panelOpen, setPanelOpen] = useState(false);

  // TODO: Replace with real data from the database
  const facultyList = [
    { id: 'f1', name: 'faculty_name_1', email: 'faculty_email_1', department: 'faculty_dept_1', rank: 'faculty_rank_1', status: 'ranking' },
    { id: 'f2', name: 'faculty_name_2', email: 'faculty_email_2', department: 'faculty_dept_2', rank: 'faculty_rank_2', status: 'ranking' },
    { id: 'f3', name: 'faculty_name_3', email: 'faculty_email_3', department: 'faculty_dept_3', rank: 'faculty_rank_3', status: 'ranking' },
    { id: 'f4', name: 'faculty_name_4', email: 'faculty_email_4', department: 'faculty_dept_4', rank: 'faculty_rank_4', status: 'ranking' },
    { id: 'f5', name: 'faculty_name_5', email: 'faculty_email_5', department: 'faculty_dept_5', rank: 'faculty_rank_5', status: 'ranking' },
    { id: 'f6', name: 'faculty_name_6', email: 'faculty_email_6', department: 'faculty_dept_6', rank: 'faculty_rank_6', status: 'ranking' },
    { id: 'f7', name: 'faculty_name_7', email: 'faculty_email_7', department: 'faculty_dept_7', rank: 'faculty_rank_7', status: 'inactive' },
    { id: 'f8', name: 'faculty_name_8', email: 'faculty_email_8', department: 'faculty_dept_8', rank: 'faculty_rank_8', status: 'ranking' },
  ];

  return (
    <div className="app">
      <Sidebar />

      <div className="main-white">
        <div className="content">

          <div className="rk-card-header">
            <span className="rk-card-title">User Management </span>
            <span className="rk-semester">1st Semester AY 2026–2027</span>
          </div>

          {/* Toolbar */}
          <div className="toolbar">
            <div className="toolbar-left">
              <span className="toolbar-label">Faculty Users</span>
              <div className="search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search faculty name" />
              </div>
              <div className="filter-wrap">
                <select><option>All Departments</option><option>CEAS</option><option>CCS</option><option>CBA</option><option>BSA</option></select>
              </div>
              <div className="filter-wrap">
                <select><option>For Ranking</option><option>Inactive</option><option>All Status</option></select>
              </div>
            </div>
            <button className="btn btn-add">
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
                <th>Current Takers</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map((faculty) => (
                <FacultyRow key={faculty.id} faculty={faculty} onEdit={() => setPanelOpen(true)} />
              ))}
            </tbody>
          </table>

        </div>
      </div>

      {panelOpen && <EditPanel onClose={() => setPanelOpen(false)} />}
    </div>
  );
}