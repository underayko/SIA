import { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './review.css';
import { supabase } from '../supabase';

// ══ CRITERIA DEFINITIONS (A-L for all areas) ═════════════════
const CRITERIA_DEFINITIONS = {
  1: [ // Area 1: Educational Qualifications — max 85 pts, weight 30%
    { label: 'A',   title: 'Associate Courses/Program (2 years)',                              points: 25.00, maxPoints: 25.00, weight: '30%' },
    { label: 'B',   title: "Bachelor's Degree (4 years to 5 years)",                           points: 45.00, maxPoints: 45.00, weight: '30%' },
    { label: 'C',   title: "Diploma course (above Bachelor's Degree)",                         points: 46.00, maxPoints: 46.00, weight: '30%' },
    { label: 'D',   title: "Master's Program",                                                 points: 0,     maxPoints: 0,     weight: '30%' },
    { label: 'D.1', title: 'MA/MS Units (6-12 units)',                                        points: 47.00, maxPoints: 47.00, weight: '30%' },
    { label: 'D.2', title: 'MA/MS Units (13-18 units)',                                       points: 49.00, maxPoints: 49.00, weight: '30%' },
    { label: 'D.3', title: 'MA/MS Units (19-24 units)',                                       points: 51.00, maxPoints: 51.00, weight: '30%' },
    { label: 'D.4', title: 'MA/MS Units (25-30 units)',                                       points: 53.00, maxPoints: 53.00, weight: '30%' },
    { label: 'D.5', title: 'MA/MS Units (31-up units)',                                       points: 55.00, maxPoints: 55.00, weight: '30%' },
    { label: 'E',   title: 'Comprehensive Exam Passed',                                       points: 58.00, maxPoints: 58.00, weight: '30%' },
    { label: 'F',   title: "Master's Degree (non-thesis)",                                    points: 60.00, maxPoints: 60.00, weight: '30%' },
    { label: 'G',   title: 'Thesis Defended',                                                 points: 62.00, maxPoints: 62.00, weight: '30%' },
    { label: 'H',   title: "Master's Degree (Additional 2 points for another discipline)",    points: 65.00, maxPoints: 65.00, weight: '30%' },
    { label: 'I',   title: 'LLB and MD (Passed the bar and board exam)',                      points: 65.00, maxPoints: 65.00, weight: '30%' },
    { label: 'J',   title: 'Doctoral Program',                                                points: 0,     maxPoints: 0,     weight: '30%' },
    { label: 'J.1', title: 'Doctoral Units (9-18 units)',                                     points: 67.00, maxPoints: 67.00, weight: '30%' },
    { label: 'J.2', title: 'Doctoral Units (19-27 units)',                                    points: 69.00, maxPoints: 69.00, weight: '30%' },
    { label: 'J.3', title: 'Doctoral Units (28-36 units)',                                    points: 71.00, maxPoints: 71.00, weight: '30%' },
    { label: 'J.4', title: 'Doctoral Units (37-45 units)',                                    points: 73.00, maxPoints: 73.00, weight: '30%' },
    { label: 'J.5', title: 'Doctoral Units (46-up units)',                                    points: 75.00, maxPoints: 75.00, weight: '30%' },
    { label: 'K',   title: 'Comprehensive Exam Passed',                                       points: 80.00, maxPoints: 80.00, weight: '30%' },
    { label: 'L',   title: 'Doctorate Degree (Additional 5 points for another discipline)',   points: 85.00, maxPoints: 85.00, weight: '30%' },
  ],
  // TODO: Areas 2–10 are temporarily using Area 1 titles until correct criteria images are provided
  2: null, 3: null, 4: null, 5: null, 6: null, 7: null, 8: null, 9: null, 10: null,
};

// ══ HELPER: Generate Criteria PDF HTML ════════════════════════
function generateCriteriaPdfHtml(areaId, areaName) {
  const criteria = CRITERIA_DEFINITIONS[areaId] || [];
  
  const html = `
    <html>
      <head>
        <title>${areaName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; background: #ddd; padding: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #999; padding: 10px; text-align: left; }
          th { background: #f0f0f0; font-weight: bold; }
          tr:nth-child(even) { background: #f9f9f9; }
          .points { text-align: right; width: 100px; }
        </style>
      </head>
      <body>
        <h1>${areaName}</h1>
        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Criteria</th>
              <th>Title</th>
              <th class="points">Points</th>
            </tr>
          </thead>
          <tbody>
            ${criteria.map(c => `
              <tr>
                <td><strong>${c.label}</strong></td>
                <td>${c.title}</td>
                <td class="points">${c.points.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;
  
  return html;
}

// ══ HELPER: Download Criteria as PDF ═════════════════════════
function downloadCriteriaAsPdf(areaId, areaName) {
  const html = generateCriteriaPdfHtml(areaId, areaName);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${areaName.replace(/\s+/g, '_')}_Criteria.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


// ══ FACULTY INFO CARD (shared) ═══════════════════════════════
function FacultyInfoCard({ facultyData, applicationData, onEditFinalScore, isEditingFinalScore, draftScore, onDraftScoreChange, onSaveFinalScore, isSavingFinalScore }) {
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
          <div className="fi-field">
            <label>Final Score</label>
            {!isEditingFinalScore ? (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span>{applicationData.display_score ?? 'Not scored'}</span>
                <button
                  onClick={() => onEditFinalScore()}
                  style={{
                    padding: '4px 8px',
                    background: '#dbeafe',
                    color: '#0284c7',
                    border: '1px solid #0284c7',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  ✏
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  value={draftScore}
                  onChange={(e) => onDraftScoreChange(e.target.value)}
                  step="0.01"
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px',
                    width: '80px'
                  }}
                />
                <button
                  onClick={() => onSaveFinalScore()}
                  disabled={isSavingFinalScore}
                  style={{
                    padding: '6px 10px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    opacity: isSavingFinalScore ? 0.6 : 1
                  }}
                >
                  {isSavingFinalScore ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingFinalScore(false)}
                  style={{
                    padding: '6px 10px',
                    background: '#f3f4f6',
                    color: '#6b7280',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
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

// ══ PDF VIEWER COMPONENT ══════════════════════════════════════
function DocumentViewer({ fileUrl, fileName, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!fileUrl) return null;

  // Check if it's a PDF
  const isPDF = fileUrl.toLowerCase().endsWith('.pdf') || fileUrl.includes('application/pdf');

  const handleDownloadPDF = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: isFullscreen ? '95vw' : '90vw',
        height: isFullscreen ? '95vh' : '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f9fafb'
        }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>
              {fileName || 'Document Viewer'}
            </h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>
              {isPDF ? 'PDF Document' : 'Document'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              style={{
                padding: '8px 12px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#2563eb'}
              onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Open
            </a>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              title="Download file"
              style={{
                padding: '8px 12px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isDownloading ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'background 0.2s',
                opacity: isDownloading ? 0.6 : 1
              }}
              onMouseEnter={(e) => !isDownloading && (e.target.style.background = '#059669')}
              onMouseLeave={(e) => !isDownloading && (e.target.style.background = '#10b981')}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              style={{
                padding: '8px 12px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#4f46e5'}
              onMouseLeave={(e) => e.target.style.background = '#6366f1'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                {isFullscreen ? (
                  <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
                ) : (
                  <path d="M8 3v4a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-4a2 2 0 012-2h3M3 16h4a2 2 0 012 2v4"/>
                )}
              </svg>
            </button>
            <button
              onClick={onClose}
              title="Close viewer"
              style={{
                padding: '8px 12px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '600',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', background: '#f3f4f6' }}>
          {isPDF ? (
            <iframe
              src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title={fileName}
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              flexDirection: 'column',
              color: '#6b7280'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: '48px', height: '48px', marginBottom: '12px' }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
              </svg>
              <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '500' }}>Document Preview</p>
              <p style={{ margin: 0, fontSize: '12px' }}>Use the buttons above to view or download</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══ SCORING CRITERIA PANEL ════════════════════════════════════
function ScoringCriteriaPanel({ area, submission, criteria, onClose, areaEvalData, onScoreChange, isSavingScore, onViewDocument }) {
  const [editingScore, setEditingScore] = useState(false);
  const [scoreValue, setScoreValue] = useState(submission?.hr_points || '');
  const [isDownloadingDoc, setIsDownloadingDoc] = useState(false);

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

  const handleDownloadDocument = async () => {
    if (!submission?.file_path) return;
    try {
      setIsDownloadingDoc(true);
      const response = await fetch(submission.file_path);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = submission.file_path.split('/').pop() || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    } finally {
      setIsDownloadingDoc(false);
    }
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

      {/* Pending Faculty Submission Banner */}
      {submission?.is_placeholder && (
        <div style={{ padding: '12px 16px', background: '#fef3c7', borderBottom: '1px solid #fcd34d', color: '#92400e' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span><strong>⏳ Pending Faculty Submission</strong> — Faculty has not yet submitted for this area. You can still view and apply the rubric template.</span>
          </div>
        </div>
      )}

      {/* Area Score Block */}
      {submission && !submission.is_placeholder && (
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

      {/* Performance Score Criteria (A-L) */}
      {area.area_id && (CRITERIA_DEFINITIONS[area.area_id] || CRITERIA_DEFINITIONS[1]) && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Evaluation Criteria</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#374151', width: '50px' }}>Criteria</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#374151' }}>Title</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '70px' }}>Max Pts</th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '60px' }}>Weight </th>
                <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '60px' }}>Score </th>
              </tr>
            </thead>
            <tbody>
              {(CRITERIA_DEFINITIONS[area.area_id] || CRITERIA_DEFINITIONS[1]).map((criterion, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ textAlign: 'center', padding: '8px', color: '#1f2937', fontWeight: '600' }}>{criterion.label}</td>
                  <td style={{ padding: '8px', color: '#1f2937', fontSize: '11px' }}>{criterion.title}</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: '#059669', fontWeight: '600' }}>{criterion.maxPoints > 0 ? criterion.maxPoints.toFixed(2) : '—'}</td>
                  <td style={{ textAlign: 'right', padding: '8px', color: '#6b7280', fontSize: '11px' }}>{criterion.weight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Submission Details */}
      {submission && (
        <>
          <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Submission Information</div>
            {submission.is_placeholder ? (
              <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '6px', padding: '12px', fontSize: '13px', color: '#92400e' }}>
                <div style={{ fontWeight: '500', marginBottom: '6px' }}>⏳ Awaiting Faculty Submission</div>
                <p style={{ margin: '0', fontSize: '12px', lineHeight: '1.5' }}>
                  Faculty has not yet submitted a document for this area. Once submitted, it will appear here and you can review and score it.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Area Name</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>{submission.area?.area_name || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>Upload Date</div>
                  <div style={{ fontWeight: '600', color: '#1f2937' }}>
                    {submission.uploaded_at ? new Date(submission.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}>HR Points</div>
                  <div style={{ fontWeight: '600', color: '#059669' }}>{Number(submission.hr_points || 0).toFixed(2)}</div>
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
              </div>
            )}
          </div>

          {/* Submitted Documents */}
          {submission.file_path && !submission.is_placeholder && (
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                ✓ Faculty Submitted Document
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#1f2937', fontWeight: '500', fontSize: '13px', wordBreak: 'break-word', marginBottom: '6px' }}>
                      {submission.file_path.split('/').pop() || 'Submitted Document'}
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '12px', lineHeight: '1.4' }}>
                      <div>📅 {submission.uploaded_at ? new Date(submission.uploaded_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date unknown'}</div>
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#9ca3af' }}>
                        {submission.file_path.includes('supabase') ? '📁 Cloud Storage (Supabase)' : '📁 Storage'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexDirection: 'column' }}>
                    <button
                      onClick={() => onViewDocument && onViewDocument({ url: submission.file_path, name: submission.file_path.split('/').pop() || 'Document' })}
                      title="View document"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        background: '#0284c7',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        border: 'none',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#0369a1'}
                      onMouseLeave={(e) => e.target.style.background = '#0284c7'}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                      View
                    </button>
                    <button
                      onClick={handleDownloadDocument}
                      disabled={isDownloadingDoc}
                      title="Download file"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '6px 10px',
                        background: '#16a34a',
                        color: 'white',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: isDownloadingDoc ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s',
                        border: 'none',
                        whiteSpace: 'nowrap',
                        opacity: isDownloadingDoc ? 0.6 : 1
                      }}
                      onMouseEnter={(e) => !isDownloadingDoc && (e.target.style.background = '#15803d')}
                      onMouseLeave={(e) => !isDownloadingDoc && (e.target.style.background = '#16a34a')}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '12px', height: '12px' }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      {isDownloadingDoc ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              </div>
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
  const areaId = area.area_id || 1;
  const areaCriteria = CRITERIA_DEFINITIONS[areaId] || CRITERIA_DEFINITIONS[1];

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
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Performance Score (A-L)</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div>
                <label htmlFor={`score-input-${area.id}`} style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>Total Score</label>
                <input
                  id={`score-input-${area.id}`}
                  type="number"
                  min="0"
                  max={Number.isFinite(maxPoints) && maxPoints > 0 ? maxPoints : undefined}
                  step="0.01"
                  value={draftScore}
                  onChange={(e) => onDraftChange(area.id, e.target.value)}
                  style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '100px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#374151', marginBottom: '4px', display: 'block' }}>Max Points</label>
                <div style={{ padding: '6px 8px', background: '#f3f4f6', borderRadius: '4px', fontSize: '13px', fontWeight: '600', color: '#1f2937', width: '100px' }}>
                  {maxPoints}
                </div>
              </div>
            </div>
            <button
              type="button"
              className="save-score-btn"
              onClick={() => onSave(area)}
              disabled={isSaving}
              style={{ padding: '8px 16px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', opacity: isSaving ? 0.6 : 1 }}
            >
              {isSaving ? 'Saving...' : 'Save Score'}
            </button>
          </div>

          {areaCriteria.length > 0 && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Evaluation Criteria</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #d1d5db' }}>
                    <th style={{ textAlign: 'center', padding: '8px', fontWeight: '600', color: '#374151', width: '50px' }}>Criteria</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: '600', color: '#374151' }}>Title</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '70px' }}>Max Pts</th>
                    <th style={{ textAlign: 'right', padding: '8px', fontWeight: '600', color: '#374151', width: '60px' }}>Weight</th>
                  </tr>
                </thead>
                <tbody>
                  {areaCriteria.map((criterion, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ textAlign: 'center', padding: '8px', color: '#1f2937', fontWeight: '600' }}>{criterion.label}</td>
                      <td style={{ padding: '8px', color: '#1f2937', fontSize: '11px' }}>{criterion.title}</td>
                      <td style={{ textAlign: 'right', padding: '8px', color: '#059669', fontWeight: '600' }}>{criterion.maxPoints > 0 ? criterion.maxPoints.toFixed(2) : '—'}</td>
                      <td style={{ textAlign: 'right', padding: '8px', color: '#6b7280', fontSize: '11px' }}>{criterion.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  const [editingFinalScore, setEditingFinalScore] = useState(false);
  const [draftFinalScore, setDraftFinalScore] = useState('');
  const [savingFinalScore, setSavingFinalScore] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching applications data (Supabase)...');

      // ═══════════════════════════════════════════════════════════════
      // COMPREHENSIVE DEBUG: Check what's actually in cycle_participants
      // ═══════════════════════════════════════════════════════════════
      const { data: debugAllParticipants, error: debugError1 } = await supabase
        .from('cycle_participants')
        .select('*')
        .limit(100);
      
      console.log('🔍 DEBUG: Total participants in DB:', {
        count: debugAllParticipants?.length || 0,
        sampleRecords: debugAllParticipants?.slice(0, 5),
        allStatuses: debugAllParticipants?.map(p => ({ cycle_id: p.cycle_id, faculty_id: p.faculty_id, status: p.status, status_type: typeof p.status }))
      });

      // Strategy: Find cycles that HAVE participants, prioritizing those with status open/submissions_closed
      // First, get all cycles with any participants
      const { data: allCycles, error: allCyclesError } = await supabase
        .from('ranking_cycles')
        .select('*')
        .order('created_at', { ascending: false });
      if (allCyclesError) throw allCyclesError;

      console.log('📅 All cycles in system:', allCycles?.map(c => ({ id: c.cycle_id, status: c.status, sem: c.semester })));

      // Get cycles that have accepted participants
      const { data: cyclesWithParticipants, error: cyclesWithParticipantsError } = await supabase
        .from('cycle_participants')
        .select('cycle_id, status')
        .eq('status', 'accepted');
      if (cyclesWithParticipantsError) throw cyclesWithParticipantsError;

      console.log('🔍 RAW cycle_participants query (status=accepted):', {
        count: cyclesWithParticipants?.length || 0,
        data: cyclesWithParticipants
      });

      // Also get ALL participants to see what statuses exist
      const { data: allParticipantsDebug } = await supabase
        .from('cycle_participants')
        .select('cycle_id, status');
      
      const uniqueStatuses = new Set(allParticipantsDebug?.map(p => p.status) || []);
      console.log('🔎 DEBUG: ALL participant statuses in system:', Array.from(uniqueStatuses));

      // If no accepted found, try alternative statuses
      if ((!cyclesWithParticipants || cyclesWithParticipants.length === 0) && allParticipantsDebug && allParticipantsDebug.length > 0) {
        const firstStatus = allParticipantsDebug[0].status;
        console.warn(`⚠️ No 'accepted' status found! First status in DB is: "${firstStatus}". Trying that...`);
        
        const { data: cyclesWithFirstStatus } = await supabase
          .from('cycle_participants')
          .select('cycle_id, status')
          .eq('status', firstStatus);
        
        console.log(`🔄 Query with status="${firstStatus}":`, {
          count: cyclesWithFirstStatus?.length || 0,
          data: cyclesWithFirstStatus
        });
      }

      const cycleIdsWithParticipants = new Set(
        (cyclesWithParticipants || []).map((p) => p.cycle_id)
      );
      console.log('🎯 Cycles with accepted participants:', Array.from(cycleIdsWithParticipants));

      // Filter to cycles that both (a) exist and (b) have participants
      const cyclesWithData = (allCycles || []).filter((c) =>
        cycleIdsWithParticipants.has(c.cycle_id)
      );

      console.log('✅ Cycles WITH participants:', cyclesWithData?.map(c => ({ id: c.cycle_id, status: c.status })));

      // Prefer open/submissions_closed, otherwise latest
      let activeCycle = cyclesWithData.find(c =>
        ['open', 'submissions_closed'].includes(c.status)
      ) || cyclesWithData[0];

      if (!activeCycle) {
        console.warn('❌ No cycles with participants found');
        console.log('🔴 COMPREHENSIVE DEBUG INFO:', {
          totalCycles: allCycles?.length,
          allCycleIds: allCycles?.map(c => ({ id: c.cycle_id, status: c.status })),
          totalParticipants: debugAllParticipants?.length,
          participantsByStatus: {
            allRecords: allParticipantsDebug?.length,
            cycleIdsInParticipants: Array.from(cycleIdsWithParticipants),
            acceptedCount: cyclesWithParticipants?.length
          },
          cycleIdsWithDataCount: cyclesWithData?.length,
          cycleIdsWithData: cyclesWithData?.map(c => c.cycle_id),
          sample_first_participant: debugAllParticipants?.[0]
        });
        setCurrentCycle(null);
        setApplications([]);
        return;
      }

      setCurrentCycle(activeCycle);
      console.log('✅ Active cycle selected:', { 
        cycle_id: activeCycle.cycle_id, 
        status: activeCycle.status, 
        semester: activeCycle.semester, 
        year: activeCycle.year
      });
      console.log('⚠️ IS THIS CYCLE 25?', activeCycle.cycle_id === 25 ? '✅ YES' : `❌ NO, it is ${activeCycle.cycle_id}`);

      // First check: ANY participants for this cycle (regardless of status)
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('cycle_participants')
        .select('*')
        .eq('cycle_id', activeCycle.cycle_id);
      if (allParticipantsError) throw allParticipantsError;
      console.log('🔎 ALL participants (any status) for cycle', activeCycle.cycle_id, ':', {
        count: allParticipants?.length || 0,
        data: allParticipants
      });

      // Get participants for this cycle (only accepted are considered actively applied)
      const { data: participantsData, error: participantsError } = await supabase
        .from('cycle_participants')
        .select('faculty_id, status')
        .eq('cycle_id', activeCycle.cycle_id)
        .eq('status', 'accepted');
      if (participantsError) throw participantsError;

      console.log('📋 ACCEPTED participants response:', {
        count: participantsData?.length || 0,
        cycle_id: activeCycle.cycle_id,
        data: participantsData
      });

      const participantFacultyIds = Array.from(
        new Set((participantsData || []).map((p) => {
          console.log('🔍 Mapping participant:', p, '-> faculty_id:', p.faculty_id);
          return p.faculty_id;
        }).filter(Boolean))
      );

      console.log('👥 Extracted participant faculty IDs:', participantFacultyIds);

      if (participantFacultyIds.length === 0) {
        // No one applied for this cycle yet
        console.warn('⚠️ No accepted participants for this cycle');
        setApplications([]);
        return;
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

      // Get applications only for faculty who are participants in the active cycle
      // AND belong to the active cycle (critical for cycle isolation)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .in('faculty_id', participantFacultyIds)
        .eq('cycle_id', activeCycle.cycle_id)
        .order('created_at', { ascending: false });
      if (applicationsError) throw applicationsError;

      console.log('📊 Applications query result:', {
        participantFacultyIds,
        cycle_id: activeCycle.cycle_id,
        applicationsCount: applicationsData?.length || 0,
        firstApp: applicationsData?.[0],
        allApps: applicationsData
      });

      // Keep only latest application per faculty for the active cycle view
      const latestByFaculty = new Map();
      for (const app of (applicationsData || [])) {
        if (!latestByFaculty.has(app.faculty_id)) {
          latestByFaculty.set(app.faculty_id, app);
        }
      }
      const cycleScopedApplications = Array.from(latestByFaculty.values());

      console.log('🎯 After deduping (latest per faculty):', {
        totalCount: cycleScopedApplications.length,
        facultyIds: cycleScopedApplications.map(a => a.faculty_id)
      });

      const applicationIds = cycleScopedApplications.map((app) => app.application_id);
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
      for (const appData of cycleScopedApplications) {
        // Get faculty data
        const { data: facultyData, error: facultyError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', appData.faculty_id)
          .single();
        if (facultyError) continue;

        // Skip VPAA users - only show faculty
        if (facultyData?.role === 'vpaa') {
          console.log(`⏭️ Skipping VPAA user: ${facultyData.name_first} ${facultyData.name_last}`);
          continue;
        }

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
      console.log('📄 Fetching area submissions for application:', applicationId, typeof applicationId);

      // ⚠️ DEBUG: Check if application_id field exists
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('area_submissions')
        .select('*')
        .eq('application_id', applicationId);
      
      if (submissionsError) {
        console.error('❌ Database error:', submissionsError);
        throw submissionsError;
      }

      console.log('📊 Raw submissions from DB:', {
        count: submissionsData?.length || 0,
        applicationIdParam: applicationId,
        firstRecord: submissionsData?.[0],
        allApplicationIds: submissionsData?.map(s => ({ id: s.submission_id, app_id: s.application_id }))
      });

      const submissions = (submissionsData || []).map((submissionData) => {
        const area = areas.find((a) => a.area_id === submissionData.area_id);

        return {
          id: submissionData.submission_id,
          ...submissionData,
          area: area || { area_name: `Unknown Area ${submissionData.area_id}`, max_possible_points: 0 }
        };
      });

      // 🆕 Add areas with rubric templates but no submissions yet
      // These areas should appear for all applications so everyone is scored consistently
      const areasWithRubrics = areas.filter(a => a.template_file_path); // Areas that have rubrics uploaded
      const submittedAreaIds = new Set(submissions.map(s => s.area_id));
      
      const areasWithoutSubmissions = areasWithRubrics
        .filter(area => !submittedAreaIds.has(area.area_id))
        .map(area => ({
          id: `placeholder-${area.area_id}-${applicationId}`, // Unique placeholder ID
          submission_id: `placeholder-${area.area_id}-${applicationId}`,
          application_id: applicationId,
          area_id: area.area_id,
          file_path: null,
          hr_points: 0,
          vpaa_points: 0,
          csv_total_average_rate: null,
          uploaded_at: null,
          is_placeholder: true, // Flag to show this is not an actual submission yet
          area: area
        }));

      const allSubmissions = [...submissions, ...areasWithoutSubmissions];

      setAreaSubmissions(allSubmissions);
      setDraftScores(
        allSubmissions.reduce((acc, item) => {
          acc[item.id] = item.hr_points ?? '';
          return acc;
        }, {})
      );
      setExpandedAreaId(null);
      console.log('✅ Fetched area submissions:', submissions.length, 'actual +', areasWithoutSubmissions.length, 'from rubrics, total:', allSubmissions.length, 'for application:', applicationId);
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

  const calculateTotalScore = (submissions) => {
    return submissions.reduce((sum, submission) => sum + Number(submission.hr_points || 0), 0);
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

      const totalScore = calculateTotalScore(updatedSubmissions);

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

  const handleEditFinalScore = () => {
    setDraftFinalScore(selectedApplication?.final_score || selectedApplication?.hr_score || '');
    setEditingFinalScore(true);
  };

  const handleSaveFinalScore = async () => {
    const parsedScore = Number.parseFloat(draftFinalScore);

    if (!Number.isFinite(parsedScore)) {
      alert('Please enter a valid numeric score.');
      return;
    }

    try {
      setSavingFinalScore(true);

      const { error: updateError } = await supabase
        .from('applications')
        .update({ final_score: parsedScore })
        .eq('application_id', selectedApplication.id);

      if (updateError) throw updateError;

      const updatedSelectedApplication = {
        ...selectedApplication,
        final_score: parsedScore,
        display_score: parsedScore
      };

      setSelectedApplication(updatedSelectedApplication);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, final_score: parsedScore, display_score: parsedScore }
            : app
        )
      );

      setEditingFinalScore(false);
      alert('Final score saved successfully.');
    } catch (error) {
      console.error('❌ Error saving final score:', error);
      alert('Failed to save final score. Please try again.');
    } finally {
      setSavingFinalScore(false);
    }
  };

  const handleSelectArea = async (area) => {
    setLoadingAreaDetails(true);
    try {
      // Find the submission from local state
      const localSubmission = areaSubmissions.find(s => s.id === area.id);
      
      // Get area ID and application ID
      const areaId = area.area_id || area.id || 1;
      const appId = selectedApplication?.id;
      
      // Try to fetch detailed area evaluation data from backend for criteria
      try {
        const response = await fetch(`http://localhost:5000/review/area-evaluation/${appId}/${areaId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedArea({
            ...area,
            ...data.area,
            description: data.area?.description || area.description || ''
          });
          setAreaCriteria(data.criteria || []);
        } else {
          // Fall back to local area data if backend fails
          setSelectedArea({
            ...area,
            description: localSubmission?.area?.description || area.description || ''
          });
          setAreaCriteria([]);
        }
      } catch (err) {
        console.log('Backend not available, using local area data');
        setSelectedArea({
          ...area,
          description: localSubmission?.area?.description || area.description || ''
        });
        setAreaCriteria([]);
      }
    } catch (err) {
      console.error('Error in handleSelectArea:', err);
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
    label: submission.area.area_name,
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
        label: submission.area?.area_name || submission.area_id,
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
                  <div style={{ fontSize: '16px', marginBottom: '8px' }}>No cycle applications found</div>
                  <div style={{ fontSize: '14px' }}>
                    Only faculty applied in the active cycle are shown. Add participants/applications for this cycle first.
                  </div>
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

              <FacultyInfoCard 
                facultyData={selectedFaculty} 
                applicationData={selectedApplicationForDisplay}
                onEditFinalScore={handleEditFinalScore}
                isEditingFinalScore={editingFinalScore}
                draftScore={draftFinalScore}
                onDraftScoreChange={setDraftFinalScore}
                onSaveFinalScore={handleSaveFinalScore}
                isSavingFinalScore={savingFinalScore}
              />
              <div className="submitted-label">Submitted Areas ({submittedAreas.length})</div>

              <div className="detail-grid">
                <div>
                  {submittedAreas.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
                      <div style={{ fontSize: '16px', marginBottom: '8px' }}>No area submissions found</div>
                      <div style={{ fontSize: '14px' }}>This faculty member has not submitted any areas for review.</div>
                    </div>
                  ) : (
                    <>
                      <div style={{ marginBottom: '16px', padding: '12px', background: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', fontSize: '13px', color: '#1e40af' }}>
                        <strong>Documents:</strong> Click the eye icon to view criteria & submission details
                      </div>
                      {submittedAreas.map((area, i) => (
                        <AreaCard
                          key={area.id ?? i}
                          area={area}
                          isExpanded={expandedAreaId === area.id}
                          draftScore={draftScores[area.id] ?? ''}
                          onToggle={handleToggleArea}
                          onDraftChange={handleDraftScoreChange}
                          onSave={handleSaveAreaScore}
                          isSaving={savingAreaId === area.id}
                          onSelectArea={() => {
                            const submission = areaSubmissions.find(s => s.id === area.id);
                            const fullAreaData = areas.find(a => a.area_id === submission?.area_id);
                            handleSelectArea({
                              ...area,
                              area_id: submission?.area_id,
                              application_id: selectedApplication?.id,
                              label: area.label,
                              template_file_path: fullAreaData?.template_file_path,
                              template_file_name: fullAreaData?.template_file_name
                            });
                          }}
                        />
                      ))}
                    </>
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
                      onViewDocument={setViewingDocument}
                    />
                  ) : (
                    <>
                      <div className="pdf-panel-header">
                        <div className="pdf-panel-title">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          Scoring &amp; Documents
                        </div>
                      </div>
                      <div className="pdf-no-submission">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div style={{ marginTop: '12px' }}>
                          <strong>Select an area to view:</strong>
                          <ul style={{ marginTop: '8px', textAlign: 'left', fontSize: '12px', lineHeight: '1.6' }}>
                            <li>Scoring criteria &amp; performance metrics</li>
                            <li>Faculty-submitted documents</li>
                            <li>Area-specific evaluation details</li>
                          </ul>
                        </div>
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
              <FacultyInfoCard 
                facultyData={selectedFaculty} 
                applicationData={selectedApplicationForDisplay}
                onEditFinalScore={handleEditFinalScore}
                isEditingFinalScore={editingFinalScore}
                draftScore={draftFinalScore}
                onDraftScoreChange={setDraftFinalScore}
                onSaveFinalScore={handleSaveFinalScore}
                isSavingFinalScore={savingFinalScore}
              />
              <div className="submitted-label">Qualification Review</div>
              <SummaryView onBack={handleBackToDetail} areaScores={summaryAreaScores} />
            </>
          )}

        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer 
          fileUrl={viewingDocument.url}
          fileName={viewingDocument.name}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
}