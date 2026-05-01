import { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './review.css';
import { supabase } from '../supabase';


// ══ FACULTY INFO CARD (shared) ═══════════════════════════════
function FacultyInfoCard({ facultyData, applicationData }) {
  if (!facultyData || !applicationData) {
    return (
      <div className="faculty-card">
        <div className="faculty-card-header">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Faculty Information
        </div>
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Loading faculty information...
        </div>
      </div>
    );
  }

  return (
    <div className="faculty-card">
      <div className="faculty-card-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Faculty Information
      </div>
      <div className="faculty-info-grid">
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>Personal Details</div>
          <div className="fi-field"><label>Name</label><span>{facultyData.name_last}, {facultyData.name_first} {facultyData.name_middle}.</span></div>
          <div className="fi-field"><label>Department</label><span>{facultyData.department_name || 'N/A'}</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2-2v2"/></svg>Employment Status</div>
          <div className="fi-field"><label>Present Rank</label><span>{facultyData.current_rank || 'N/A'}</span></div>
          <div className="fi-field"><label>Nature of Appointment</label><span>{facultyData.nature_of_appointment || 'N/A'}</span></div>
          <div className="fi-field"><label>Current Salary</label><span>₱{facultyData.current_salary ? Number(facultyData.current_salary).toLocaleString('en-PH', {minimumFractionDigits: 2}) : 'N/A'}</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Experience &amp; Rating</div>
          <div className="fi-field"><label>Teaching Exp.</label><span>{facultyData.teaching_experience_years || 0} years</span></div>
          <div className="fi-field"><label>Industry Exp.</label><span>{facultyData.industry_experience_years || 0} years</span></div>
          <div className="fi-field"><label>Final Score</label><span>{applicationData.display_score ?? 'Not scored'}</span></div>
          <div className="fi-field"><label>Status</label><span>{applicationData.status?.replace(/_/g, ' ') || 'N/A'}</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>Educational Attainment</div>
          <div className="fi-edu"><strong>{facultyData.educational_attainment || 'Not specified'}</strong><small>Educational Background</small></div>
          <div className="fi-label" style={{ marginTop: '10px' }}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Eligibility &amp; Exams</div>
          <div className="fi-field"><span>{facultyData.eligibility_exams || 'None specified'}</span></div>
        </div>
        <div>
          <div className="fi-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Application Details</div>
          <div className="fi-field"><label>Applying For</label><span>{facultyData.applying_for || 'N/A'}</span></div>
          <div className="fi-field"><label>Last Promotion</label><span>{facultyData.date_of_last_promotion ? new Date(facultyData.date_of_last_promotion).toLocaleDateString() : 'N/A'}</span></div>
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

// ══ SCORING CRITERIA PANEL ════════════════════════════════════
function ScoringCriteriaPanel({ area, submission, criteria, onClose, areaEvalData, onScoreChange, isSavingScore }) {
  const [editingScore, setEditingScore] = useState(false);
  const [scoreValue, setScoreValue] = useState(submission?.hr_points || '');

  const handleSaveScore = () => {
    const parsedScore = parseFloat(scoreValue);
    if (!isFinite(parsedScore)) {
      alert('Please enter a valid number');
      return;
    }
    if (onScoreChange) {
      onScoreChange(submission?.submission_id, parsedScore);
    }
    setEditingScore(false);
  };

  const totalCriteriaScore = criteria && criteria.length > 0
    ? criteria.reduce((sum, c) => sum + (c.score || 0), 0)
    : 0;

  if (!area) {
    return (
      <div className="pdf-panel">
        <div className="pdf-panel-header">
          <div className="pdf-panel-title">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Scoring Details
          </div>
          <button className="close-btn" onClick={onClose} style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
        </div>
        <div className="pdf-no-submission">
          <p>Select an area to view scoring criteria and submitted documents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-panel">
      <div className="pdf-panel-header">
        <div className="pdf-panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          {area.label || area.area_name}
        </div>
        <button className="close-btn" onClick={onClose} style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
      </div>

      {/* Area Score Block */}
      {submission && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area Score</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>
                {Number(submission.hr_points || 0).toFixed(2)}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginLeft: '8px' }}>/ {area.max || 100} pts</span>
              </div>
            </div>
            {!editingScore ? (
              <button
                onClick={() => {
                  setScoreValue(submission?.hr_points || '');
                  setEditingScore(true);
                }}
                style={{
                  padding: '8px 16px',
                  background: '#dbeafe',
                  color: '#0284c7',
                  border: '1px solid #0284c7',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ✏ Edit Score
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={scoreValue}
                  onChange={(e) => setScoreValue(e.target.value)}
                  min="0"
                  max={area.max || 100}
                  step="0.01"
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    width: '100px'
                  }}
                />
                <button
                  onClick={handleSaveScore}
                  disabled={isSavingScore}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isSavingScore ? 0.6 : 1
                  }}
                >
                  {isSavingScore ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingScore(false)}
                  style={{
                    padding: '8px 12px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {area.description && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#666' }}>
          <strong>Description:</strong> {area.description}
        </div>
      )}

      {/* Scoring Criteria Table */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Performance Criteria</div>
        {criteria && criteria.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#374151' }}>Criteria</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '80px' }}>Max Points</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '80px' }}>Weight</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '80px' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((criterion, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '8px', color: '#1f2937' }}>{criterion.label}</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>{Number(criterion.max || 0).toFixed(2)}</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: '#6b7280' }}>{(Number(criterion.weight || 0) * 100).toFixed(0)}%</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: '#059669', fontWeight: '600' }}>{Number(criterion.score || 0).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ color: '#6b7280', fontSize: '13px' }}>No criteria defined for this area</div>
        )}
      </div>

      {/* Submission Details */}
      {submission && (
        <>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Submitted Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>HR Points</div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>{Number(submission.hr_points || 0).toFixed(2)}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>VPAA Points</div>
                <div style={{ fontWeight: '600', color: '#1f2937' }}>{Number(submission.vpaa_points || 0).toFixed(2)}</div>
              </div>
              {submission.csv_total_average_rate && (
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>CSV Average Rate</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{Number(submission.csv_total_average_rate).toFixed(2)}</div>
                </div>
              )}
              {submission.uploaded_at && (
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Uploaded</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{new Date(submission.uploaded_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Evidence PDF */}
          {submission.file_path && (
            <div style={{ padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Evidence PDF</div>
              <a 
                href={submission.file_path}
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: '#059669',
                  color: 'white',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  border: 'none'
                }}
                onMouseEnter={(e) => e.target.style.background = '#047857'}
                onMouseLeave={(e) => e.target.style.background = '#059669'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download PDF
              </a>
            </div>
          )}
        </>
      )}

      {!submission && (
        <div style={{ padding: '16px', color: '#6b7280', textAlign: 'center', fontSize: '13px' }}>
          No submission found for this area
        </div>
      )}
    </div>
  );
}

// ══ AREA CARD (scoring view) ══════════════════════════════════
function AreaCard({ area, isExpanded, draftScore, onToggle, onDraftChange, onSave, isSaving, onSelectArea }) {
  const maxPoints = Number(area.max || 0);

  return (
    <div className="area-card">
      <div className="area-card-header">
        <div>
          <div className="area-card-title">{area.label}</div>
          <div className="area-card-meta">Max: {area.max} pts &nbsp;·&nbsp; <span className="excess">+0 excess</span></div>
        </div>
        <div className="area-card-right">
          <span className="area-score">{area.score}</span>
          <button 
            className="icon-btn" 
            type="button"
            onClick={() => onSelectArea(area)}
            title="View criteria and submission"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button className="icon-btn" type="button" onClick={() => onToggle(area.id)} aria-label={isExpanded ? 'Collapse scoring controls' : 'Expand scoring controls'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points={isExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'}/></svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="score-editor">
          <div className="score-editor-row">
            <label htmlFor={`score-input-${area.id}`}>HR Score</label>
            <input
              id={`score-input-${area.id}`}
              type="number"
              min="0"
              max={Number.isFinite(maxPoints) && maxPoints > 0 ? maxPoints : undefined}
              step="0.01"
              value={draftScore}
              onChange={(e) => onDraftChange(area.id, e.target.value)}
            />
            <button
              type="button"
              className="save-score-btn"
              onClick={() => onSave(area)}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Score'}
            </button>
          </div>
          <div className="score-editor-help">Allowed range: 0 to {Number.isFinite(maxPoints) ? maxPoints : 0} points</div>
        </div>
      )}
    </div>
  );
}

// ══ AREA SCORES SUMMARY + QUALIFICATION OVERVIEW ══════════════
function SummaryView({ onBack, areaScores }) {
  return (
    <div className="summary-layout">
      {/* Left: Area Scores */}
      <div className="scores-panel">
        <div className="scores-panel-title">Area Scores</div>
        {areaScores.length === 0 ? (
          <div style={{ padding: '8px 0', color: '#6b7280', fontSize: '0.8rem' }}>
            No scored area submissions yet.
          </div>
        ) : (
          areaScores.map((a, i) => (
            <div className="score-bar-item" key={i}>
              <div className="score-bar-header">
                <span>{a.label}</span>
                <span className="score-bar-val">{a.score.toFixed(2)}</span>
              </div>
              <div className="score-bar-bg">
                <div className="score-bar-fill" style={{ width: `${a.pct}%` }} />
              </div>
            </div>
          ))
        )}
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
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [areaSubmissions, setAreaSubmissions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedAreaId, setExpandedAreaId] = useState(null);
  const [draftScores, setDraftScores] = useState({});
  const [savingAreaId, setSavingAreaId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaCriteria, setAreaCriteria] = useState([]);
  const [loadingAreaDetails, setLoadingAreaDetails] = useState(false);
  const [savingAreaScore, setSavingAreaScore] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching applications data (Supabase)...');

      // Get active cycle first
      const { data: cycles, error: cyclesError } = await supabase
        .from('ranking_cycles')
        .select('*')
        .eq('status', 'open')
        .limit(1);
      if (cyclesError) throw cyclesError;
      let activeCycle = null;
      if (cycles && cycles.length > 0) {
        activeCycle = cycles[0];
        setCurrentCycle(activeCycle);
      }

      // Get areas for lookup
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('*');
      if (areasError) throw areasError;
      setAreas(areasData || []);

      // Get departments for faculty name lookup
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('department_id, department_name');
      if (departmentsError) throw departmentsError;

      const departmentById = new Map(
        (departmentsData || []).map((dept) => [dept.department_id, dept.department_name])
      );

      // Get applications with faculty data
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*');
      if (applicationsError) throw applicationsError;

      const applicationIds = (applicationsData || []).map((app) => app.application_id);
      let fallbackScoreByApplicationId = new Map();

      // Auto-fetch score fallback by summing per-area HR points when final_score is not yet saved.
      if (applicationIds.length > 0) {
        const { data: allSubmissions, error: submissionsError } = await supabase
          .from('area_submissions')
          .select('application_id, hr_points')
          .in('application_id', applicationIds);
        if (submissionsError) throw submissionsError;

        fallbackScoreByApplicationId = (allSubmissions || []).reduce((acc, row) => {
          const current = acc.get(row.application_id) || 0;
          acc.set(row.application_id, current + Number(row.hr_points || 0));
          return acc;
        }, new Map());
      }

      const applicationsWithFaculty = [];
      for (const appData of applicationsData) {
        // Get faculty data
        const { data: facultyData, error: facultyError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', appData.faculty_id)
          .single();
        if (facultyError) continue;

        const fallbackScore = fallbackScoreByApplicationId.get(appData.application_id);
        const displayScore = appData.final_score ?? appData.hr_score ?? fallbackScore ?? null;

        applicationsWithFaculty.push({
          id: appData.application_id,
          ...appData,
          display_score: displayScore,
          faculty: {
            ...facultyData,
            department_name: departmentById.get(facultyData.department_id) || 'Unknown'
          }
        });
      }

      setApplications(applicationsWithFaculty);
      console.log('✅ Fetched applications:', applicationsWithFaculty.length);

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      alert('Error loading applications data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaSubmissions = async (applicationId) => {
    try {
      console.log('📄 Fetching area submissions for application:', applicationId);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from('area_submissions')
        .select('*')
        .eq('application_id', applicationId);
      if (submissionsError) throw submissionsError;

      const submissions = (submissionsData || []).map((submissionData) => {
        const area = areas.find((a) => a.area_id === submissionData.area_id);

        return {
          id: submissionData.submission_id,
          ...submissionData,
          area: area || { area_name: `Unknown Area ${submissionData.area_id}`, max_possible_points: 0 }
        };
      });

      setAreaSubmissions(submissions);
      setDraftScores(
        submissions.reduce((acc, item) => {
          acc[item.id] = item.hr_points ?? '';
          return acc;
        }, {})
      );
      setExpandedAreaId(null);
      console.log('✅ Fetched area submissions:', submissions.length);
    } catch (error) {
      console.error('❌ Error fetching area submissions:', error);
    }
  };

  const handleReviewClick = async (application) => {
    setSelectedApplication(application);
    setSelectedFaculty(application.faculty);
    await fetchAreaSubmissions(application.id);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedApplication(null);
    setSelectedFaculty(null);
    setAreaSubmissions([]);
    setDraftScores({});
    setExpandedAreaId(null);
  };

  const handleBackToDetail = () => {
    setView('detail');
  };

  const handleToggleArea = (areaId) => {
    setExpandedAreaId((prev) => (prev === areaId ? null : areaId));
  };

  const handleDraftScoreChange = (submissionId, value) => {
    setDraftScores((prev) => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const handleSaveAreaScore = async (area) => {
    const parsedScore = Number.parseFloat(draftScores[area.id]);
    const maxPoints = Number(area.max || 0);

    if (!Number.isFinite(parsedScore)) {
      alert('Please enter a valid numeric score before saving.');
      return;
    }

    if (parsedScore < 0 || parsedScore > maxPoints) {
      alert(`Score must be between 0 and ${maxPoints}.`);
      return;
    }

    try {
      setSavingAreaId(area.id);

      const { error: submissionUpdateError } = await supabase
        .from('area_submissions')
        .update({ hr_points: parsedScore })
        .eq('submission_id', area.id);
      if (submissionUpdateError) throw submissionUpdateError;

      const updatedSubmissions = areaSubmissions.map((submission) =>
        submission.id === area.id ? { ...submission, hr_points: parsedScore } : submission
      );
      setAreaSubmissions(updatedSubmissions);

      const totalScore = updatedSubmissions.reduce((sum, submission) => {
        return sum + Number(submission.hr_points || 0);
      }, 0);

      if (selectedApplication?.id) {
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ hr_score: totalScore })
          .eq('application_id', selectedApplication.id);
        if (appUpdateError) throw appUpdateError;

        const updatedSelectedApplication = {
          ...selectedApplication,
          hr_score: totalScore,
          display_score: selectedApplication.final_score ?? totalScore
        };

        setSelectedApplication(updatedSelectedApplication);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id
              ? { ...app, hr_score: totalScore, display_score: app.final_score ?? totalScore }
              : app
          )
        );
      }

      alert('Score saved successfully.');
    } catch (error) {
      console.error('❌ Error saving score:', error);
      alert('Failed to save score. Please try again.');
    } finally {
      setSavingAreaId(null);
    }
  };

  const handleSelectArea = async (area) => {
    setLoadingAreaDetails(true);
    try {
      // Fetch detailed area evaluation data from backend
      const areaId = area.area_id || area.id || 1;
      const appId = selectedApplication?.id;
      
      const response = await fetch(`http://localhost:5000/review/area-evaluation/${appId}/${areaId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch area details');
      }
      const data = await response.json();
      setSelectedArea(data.area);
      setAreaCriteria(data.criteria || []);
    } catch (err) {
      console.error('Error fetching area details:', err);
      setSelectedArea(area);
      setAreaCriteria([]);
    } finally {
      setLoadingAreaDetails(false);
    }
  };

  const handleCloseAreaDetails = () => {
    setSelectedArea(null);
    setAreaCriteria([]);
  };

  const handleAreaScoreChange = async (submissionId, newScore) => {
    if (!submissionId) {
      alert('No submission ID found');
      return;
    }

    setSavingAreaScore(true);
    try {
      const response = await fetch(`http://localhost:5000/review/area-score/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrPoints: newScore }),
      });

      if (!response.ok) {
        throw new Error('Failed to update score');
      }

      const updatedSubmission = await response.json();
      
      // Update local state
      const updatedSubmissions = areaSubmissions.map((sub) =>
        sub.id === submissionId ? { ...sub, hr_points: newScore } : sub
      );
      setAreaSubmissions(updatedSubmissions);

      // Update total score in application
      const totalScore = updatedSubmissions.reduce((sum, submission) => {
        return sum + Number(submission.hr_points || 0);
      }, 0);

      if (selectedApplication?.id) {
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ hr_score: totalScore })
          .eq('application_id', selectedApplication.id);
        if (!appUpdateError) {
          const updatedApp = { ...selectedApplication, hr_score: totalScore, display_score: selectedApplication.final_score ?? totalScore };
          setSelectedApplication(updatedApp);
          setApplications((prev) =>
            prev.map((app) => app.id === selectedApplication.id ? { ...app, hr_score: totalScore, display_score: app.final_score ?? totalScore } : app)
          );
        }
      }

      alert('Score updated successfully');
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score: ' + err.message);
    } finally {
      setSavingAreaScore(false);
    }
  };

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.faculty.name_first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.faculty.name_last.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      app.faculty.department_name === departmentFilter ||
      app.faculty.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'pending' && ['Draft', 'Submitted', 'Under_HR_Review'].includes(app.status)) ||
      (statusFilter === 'reviewed' && ['Under_VPAA_Review', 'For_Publishing', 'Published'].includes(app.status));

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Convert area submissions to the format expected by AreaCard
  const submittedAreas = areaSubmissions.map(submission => ({
    id: submission.id,
    label: `AREA ${submission.area.area_name}`,
    max: Number(submission.area.max_possible_points || 0),
    score: Number(submission.hr_points || 0).toFixed(2),
    criteria: [] // For now, we'll keep this empty since criteria would need separate implementation
  }));

  const selectedDisplayScore = selectedApplication
    ? (selectedApplication.final_score ?? selectedApplication.hr_score ?? areaSubmissions.reduce((sum, submission) => sum + Number(submission.hr_points || 0), 0))
    : null;

  const selectedApplicationForDisplay = selectedApplication
    ? { ...selectedApplication, display_score: selectedDisplayScore }
    : selectedApplication;

  const summaryAreaScores = areaSubmissions
    .map((submission) => {
      const score = Number(submission.hr_points || 0);
      const max = Number(submission.area?.max_possible_points || 0);
      const pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;

      return {
        label: `AREA ${submission.area?.area_name || submission.area_id}`,
        max,
        score,
        pct
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="content">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading applications...</div>
              <div style={{ color: '#666' }}>Please wait while we fetch the data from the database.</div>
            </div>
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

          <div className="rk-card-header">
            <span className="rk-card-title">Review and Score</span>
            <span className="rk-semester">{currentCycle ? `${currentCycle.semester} ${currentCycle.year}` : '1st Semester AY 2026–2027'}</span>
          </div>

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <>
              <div className="toolbar">
                <div className="toolbar-left">
                  <span className="toolbar-label">Faculty Applications ({filteredApplications.length})</span>
                  <div className="search-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input 
                      type="text" 
                      placeholder="Search faculty name" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="filter-wrap">
                    <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                      <option value="all">All Departments</option>
                      <option value="CCS">CCS</option>
                      <option value="CEAS">CEAS</option>
                      <option value="CBA">CBA</option>
                      <option value="BSA">BSA</option>
                    </select>
                  </div>
                  <div className="filter-wrap">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending Review</option>
                      <option value="reviewed">Reviewed</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredApplications.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No applications found</div>
                  <div style={{ fontSize: '14px' }}>Try adjusting your search or filter criteria.</div>
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th><th>Name</th><th>Department</th>
                      <th>Current Rank</th><th>Final Score</th>
                      <th>Status</th><th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application, index) => (
                      <tr key={application.id}>
                        <td>{index + 1}</td>
                        <td className="faculty-name">{application.faculty.name_last}, {application.faculty.name_first}</td>
                        <td>{application.faculty.department_name}</td>
                        <td>{application.faculty.current_rank}</td>
                        <td>{application.display_score ?? 'Not scored'}</td>
                        <td>
                          <span className={`badge ${
                            ['Under_VPAA_Review', 'For_Publishing', 'Published'].includes(application.status) 
                              ? 'badge-reviewed' 
                              : 'badge-pending'
                          }`}>
                            {['Under_VPAA_Review', 'For_Publishing', 'Published'].includes(application.status) 
                              ? 'Reviewed' 
                              : 'Pending'
                            }
                          </span>
                        </td>
                        <td>
                          <button className="review-btn" onClick={() => handleReviewClick(application)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="7" height="7" rx="1"/>
                              <rect x="14" y="3" width="7" height="7" rx="1"/>
                              <rect x="3" y="14" width="7" height="7" rx="1"/>
                              <path d="M14 17h7M17 14v7"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}

          {/* ── DETAIL VIEW ── */}
          {view === 'detail' && (
            <>
              {/* Back Button */}
              <div style={{ marginBottom: '20px' }}>
                <button 
                  className="btn-nav btn-nav-prev" 
                  onClick={handleBackToList}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    padding: '8px 16px',
                    background: '#f8f9fa',
                    border: '1px solid #dee2e6',
                    borderRadius: '6px',
                    color: '#495057',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Applications List
                </button>
              </div>

              <FacultyInfoCard facultyData={selectedFaculty} applicationData={selectedApplicationForDisplay} />
              <div className="submitted-label">Submitted Areas ({submittedAreas.length})</div>

              <div className="detail-grid">
                <div>
                  {submittedAreas.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>No area submissions found</div>
                      <div style={{ fontSize: '14px' }}>This faculty member has not submitted any areas for review.</div>
                    </div>
                  ) : (
                    submittedAreas.map((area, i) => (
                      <AreaCard
                        key={area.id ?? i}
                        area={area}
                        isExpanded={expandedAreaId === area.id}
                        draftScore={draftScores[area.id] ?? ''}
                        onToggle={handleToggleArea}
                        onDraftChange={handleDraftScoreChange}
                        onSave={handleSaveAreaScore}
                        isSaving={savingAreaId === area.id}
                        onSelectArea={() => handleSelectArea({
                          ...area,
                          area_id: areaSubmissions.find(s => s.id === area.id)?.area_id,
                          application_id: selectedApplication?.id,
                          label: area.label
                        })}
                      />
                    ))
                  )}
                  
                  {submittedAreas.length > 0 && (
                    <div className="area-nav">
                      <button className="btn-nav btn-nav-prev" onClick={handleBackToList}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                        Back to List
                      </button>
                      <button className="btn-nav btn-nav-next" onClick={() => setView('summary')}>
                        Review Summary
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="pdf-panel">
                  {selectedArea ? (
                    <ScoringCriteriaPanel 
                      area={selectedArea}
                      submission={areaSubmissions.find(s => s.id === selectedArea.id)}
                      criteria={areaCriteria}
                      onClose={handleCloseAreaDetails}
                      areaEvalData={null}
                      onScoreChange={handleAreaScoreChange}
                      isSavingScore={savingAreaScore}
                    />
                  ) : (
                    <>
                      <div className="pdf-panel-header">
                        <div className="pdf-panel-title">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Scoring Details
                        </div>
                      </div>
                      <div className="pdf-no-submission">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Click the eye icon on an area to view scoring criteria and submission details
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ── SUMMARY / QUALIFICATION VIEW ── */}
          {view === 'summary' && (
            <>
              <FacultyInfoCard facultyData={selectedFaculty} applicationData={selectedApplicationForDisplay} />
              <div className="submitted-label">Qualification Review</div>
              <SummaryView onBack={handleBackToDetail} areaScores={summaryAreaScores} />
            </>
          )}

        </div>
      </div>
    </div>
  );
}