import { useState } from 'react';
import Sidebar from '../components/sidenav';
import './review.css';

// ══ FACULTY INFO CARD (shared) ═══════════════════════════════
function FacultyInfoCard() {
  return (
    <div className="faculty-card">
      <div className="faculty-card-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Faculty Information
      </div>
      <div className="faculty-info-grid">
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Personal Details</div>
          <div className="fi-field"><label>Name</label><span>Jenkins, Sarah A.</span></div>
          <div className="fi-field"><label>Department</label><span>CCS</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>Employment Status</div>
          <div className="fi-field"><label>Present Rank</label><span>Instructor II</span></div>
          <div className="fi-field"><label>Nature of Appointment</label><span>Permanent</span></div>
          <div className="fi-field"><label>Current Salary</label><span>₱45,000.00</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Experience &amp; Rating</div>
          <div className="fi-field"><label>Teaching Exp.</label><span>8 years</span></div>
          <div className="fi-field"><label>Industry Exp.</label><span>3 years</span></div>
          <div className="fi-field"><label>Performance Rating</label><span>4.8</span></div>
          <div className="fi-field"><label>Rating Description</label><span>Very Satisfactory</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>Educational Attainment</div>
          <div className="fi-edu"><strong>Bachelor's in Computer Science</strong><small>State University</small></div>
          <div className="fi-edu"><strong>Master's in Computer Science</strong><small>Tech Institute</small></div>
          <div className="fi-label" style={{ marginTop: '10px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Eligibility &amp; Exams</div>
          <div className="fi-field"><span>Civil Service Professional</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Application Details</div>
          <div className="fi-field"><label>Applying For</label><span>Instructor III</span></div>
          <div className="fi-field"><label>Last Promotion</label><span>05 12, 21</span></div>
        </div>
      </div>
    </div>
  );
}

// ══ LIST VIEW ════════════════════════════════════════════════
function ReviewRow({ faculty, onReview }) {
  return (
    <tr>
      <td>{faculty.rank}</td>
      <td className="faculty-name">{faculty.name}</td>
      <td>{faculty.department}</td>
      <td>{faculty.currentRank}</td>
      <td>{faculty.totalPoints}</td>
      <td><span className={`badge ${faculty.status === 'reviewed' ? 'badge-reviewed' : 'badge-pending'}`}>{faculty.status === 'reviewed' ? 'Reviewed' : 'Pending'}</span></td>
      <td>
        <button className="review-btn" onClick={() => onReview(faculty)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 17h7M17 14v7"/></svg>
        </button>
      </td>
    </tr>
  );
}

// ══ AREA CARD (scoring view) ══════════════════════════════════
function AreaCard({ area }) {
  return (
    <div className="area-card">
      <div className="area-card-header">
        <div>
          <div className="area-card-title">{area.label}</div>
          <div className="area-card-meta">Max: {area.max} pts &nbsp;·&nbsp; <span className="excess">+0 excess</span></div>
        </div>
        <div className="area-card-right">
          <span className="area-score">{area.score}</span>
          <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
          <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg></button>
        </div>
      </div>
      {area.criteria.length > 0 && (
        <table className="criteria-table">
          <thead><tr><th>Criteria</th><th>Max Points</th><th>Score</th></tr></thead>
          <tbody>
            {area.criteria.map((c, i) => (
              <tr key={i}>
                <td>{c.label}</td>
                <td>{c.max}</td>
                <td>
                  {c.score !== '—' ? (
                    <div className="score-input">
                      <span className="score-val">{c.score}</span>
                      <div className="score-arrows"><button>▲</button><button>▼</button></div>
                    </div>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ══ AREA SCORES SUMMARY + QUALIFICATION OVERVIEW ══════════════
function SummaryView({ onBack }) {
  const areaScores = [
    { label: 'AREA I: Educational Qualifications',               max: 85,  score: 50.00, pct: 59 },
    { label: 'AREA II: Research and Publications',               max: 20,  score: 10.00, pct: 50 },
    { label: 'AREA III: Teaching Experience and Prof. Services', max: 20,  score: 18.00, pct: 90 },
    { label: 'AREA IV: Performance Evaluation',                  max: 10,  score: 8.00,  pct: 80 },
    { label: 'AREA V: Training and Seminars',                    max: 20,  score: 11.00, pct: 55 },
    { label: 'AREA VI: Expert Services Rendered',                max: 20,  score: 14.00, pct: 70 },
    { label: 'AREA VII: Involvement in Prof. Organizations',     max: 10,  score: 8.00,  pct: 80 },
    { label: 'AREA VIII: Awards of Distinction',                 max: 10,  score: 9.00,  pct: 90 },
    { label: 'AREA IX: Community Outreach',                      max: 5,   score: 4.00,  pct: 80 },
    { label: 'AREA X: Professional Examination',                 max: 10,  score: 7.00,  pct: 70 },
  ];

  return (
    <div className="summary-layout">
      {/* Left: Area Scores */}
      <div className="scores-panel">
        <div className="scores-panel-title">Area Scores</div>
        {areaScores.map((a, i) => (
          <div className="score-bar-item" key={i}>
            <div className="score-bar-header">
              <span>{a.label}</span>
              <span className="score-bar-val">{a.score.toFixed(2)}</span>
            </div>
            <div className="score-bar-bg">
              <div className="score-bar-fill" style={{ width: `${a.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Right: Qualification Overview */}
      <div className="qual-panel">
        <div className="qual-panel-title">Qualification Overview</div>

        <div className="qual-row">
          <label>Experience</label>
          <div className="qual-select-wrap">
            <select><option>Select (Professor I-V)</option><option>Qualified</option><option>Not Qualified</option></select>
          </div>
        </div>
        <div className="qual-row">
          <label>Degree</label>
          <div className="qual-select-wrap">
            <select><option>Select (Professor I-V)</option><option>Qualified</option><option>Not Qualified</option></select>
          </div>
        </div>
        <div className="qual-row">
          <label>Teaching Experience</label>
          <div className="qual-select-wrap">
            <select defaultValue="Qualified"><option>Qualified</option><option>Not Qualified</option></select>
          </div>
        </div>
        <div className="qual-row">
          <label>Research Output</label>
          <div className="qual-select-wrap">
            <select defaultValue="Qualified"><option>Qualified</option><option>Not Qualified</option></select>
          </div>
        </div>
        <div className="qual-row">
          <label>Elegibility</label>
          <div className="qual-select-wrap">
            <select defaultValue="Qualified"><option>Qualified</option><option>Not Qualified</option></select>
          </div>
        </div>
        <div className="qual-row">
          <label></label>
          <span className="qual-passed">Passed</span>
        </div>

        <div className="qual-footer">
          <button className="btn-nav btn-nav-prev" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            Go Back
          </button>
          <button className="btn-completed">Completed</button>
        </div>
      </div>
    </div>
  );
}

// ══ MAIN COMPONENT ═══════════════════════════════════════════
export default function Review() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'summary'

  // TODO: Replace with real DB data
  const facultyList = [
    { id: 'r1', rank: 1, name: 'review_name_1', department: 'review_dept_1', currentRank: 'review_rank_1', totalPoints: 'review_points_1', status: 'reviewed' },
    { id: 'r2', rank: 2, name: 'review_name_2', department: 'review_dept_2', currentRank: 'review_rank_2', totalPoints: 'review_points_2', status: 'reviewed' },
    { id: 'r3', rank: 3, name: 'review_name_3', department: 'review_dept_3', currentRank: 'review_rank_3', totalPoints: 'review_points_3', status: 'reviewed' },
    { id: 'r4', rank: 4, name: 'review_name_4', department: 'review_dept_4', currentRank: 'review_rank_4', totalPoints: 'review_points_4', status: 'reviewed' },
    { id: 'r5', rank: 5, name: 'review_name_5', department: 'review_dept_5', currentRank: 'review_rank_5', totalPoints: 'review_points_5', status: 'pending' },
    { id: 'r6', rank: 6, name: 'review_name_6', department: 'review_dept_6', currentRank: 'review_rank_6', totalPoints: 'review_points_6', status: 'pending' },
    { id: 'r7', rank: 7, name: 'review_name_7', department: 'review_dept_7', currentRank: 'review_rank_7', totalPoints: 'review_points_7', status: 'pending' },
    { id: 'r8', rank: 8, name: 'review_name_8', department: 'review_dept_8', currentRank: 'review_rank_8', totalPoints: 'review_points_8', status: 'pending' },
  ];

  // TODO: Replace with real DB data
  const submittedAreas = [
    {
      label: 'AREA I: Educational Qualifications', max: '85.00', score: '50.00',
      criteria: [
        { label: 'A. Associate Courses/Program (2 years)',          max: '25.00', score: '25.50' },
        { label: "B. Bachelor's Degree (4 years to 5 years)",       max: '45.00', score: '00.00' },
        { label: "C. Diploma course (Above Bachelor's Degree)",     max: '46.00', score: '25.50' },
        { label: "D. Master's Program",                             max: '—',     score: '—'     },
        { label: 'D. 1 MA/MS Units (6–12 units)',                   max: '47.00', score: '00.00' },
      ],
    },
    {
      label: 'AREA IV: Performance Evaluation', max: '10.00', score: '10.00',
      criteria: [
        { label: '1.00 - 1.39 · Poor',  max: '1.00', score: '00.00' },
        { label: '1.40 - 1.79 · Poor',  max: '2.00', score: '00.00' },
        { label: '1.80 - 2.19 · Fair',  max: '3.00', score: '00.00' },
        { label: '2.20 - 2.29 · Fair',  max: '4.00', score: '00.00' },
      ],
    },
    {
      label: 'AREA II: Research and Publications', max: '85.00', score: '50.00',
      criteria: [],
    },
    {
      label: 'AREA V: Training and Seminars', max: '85.00', score: '50.00',
      criteria: [],
    },
  ];

  return (
    <div className="app">
      <Sidebar />

      <div className="main-white">
        <div className="content">

          <div className="rk-card-header">
            <span className="rk-card-title">Review and Score </span>
            <span className="rk-semester">1st Semester AY 2026–2027</span>
          </div>

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <>
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
                    <select><option>Pending</option><option>Reviewed</option><option>All</option></select>
                  </div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Rank</th><th>Name</th><th>Department</th>
                    <th>Current Rank</th><th>Total Points: 200.00</th>
                    <th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyList.map((f) => (
                    <ReviewRow key={f.id} faculty={f} onReview={() => setView('detail')} />
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* ── DETAIL VIEW ── */}
          {view === 'detail' && (
            <>
              <FacultyInfoCard />
              <div className="submitted-label">Submitted Areas</div>

              <div className="detail-grid">
                <div>
                  {submittedAreas.map((area, i) => (
                    <AreaCard key={i} area={area} />
                  ))}
                  <div className="area-nav">
                    <button className="btn-nav btn-nav-prev">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                      Previous Area
                    </button>
                    <button className="btn-nav btn-nav-next" onClick={() => setView('summary')}>
                      Next Area
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    </button>
                  </div>
                </div>

                <div className="pdf-panel">
                  <div className="pdf-panel-header">
                    <div className="pdf-panel-title">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      Submitted PDF
                    </div>
                    <div className="pdf-actions">
                      <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                      <button className="icon-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg></button>
                    </div>
                  </div>
                  <div className="pdf-no-submission">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    No Submission
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── SUMMARY / QUALIFICATION VIEW ── */}
          {view === 'summary' && (
            <>
              <FacultyInfoCard />
              <div className="submitted-label">Submitted Areas</div>
              <SummaryView onBack={() => setView('detail')} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}