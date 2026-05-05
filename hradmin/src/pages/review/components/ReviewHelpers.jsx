import React, { useEffect, useRef, useState } from 'react';
import { RANKING_RUBRICS } from '../../../data/rankingRubrics';
import { supabase } from '../../../supabase';

// Helper function to convert storage path to public URL
function getPublicFileUrl(storagePath) {
  if (!storagePath) return null;
  
  // If it's already a full URL, return as-is
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  
  // Get Supabase project URL from supabase client
  const supabaseUrl = supabase.supabaseUrl;
  const bucket = 'documents'; // Default bucket name
  
  // Construct public URL: https://{project}.supabase.co/storage/v1/object/public/{bucket}/{path}
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${storagePath}`;
  return publicUrl;
}

const CRITERIA_DEFINITIONS = {
  1: [
    { label: 'A', title: 'Associate Courses/Program (2 years)', points: 25.0, maxPoints: 25.0, weight: '30%' },
    { label: 'B', title: "Bachelor's Degree (4 years to 5 years)", points: 45.0, maxPoints: 45.0, weight: '30%' },
    { label: 'C', title: "Diploma course (above Bachelor's Degree)", points: 46.0, maxPoints: 46.0, weight: '30%' },
    { label: 'D', title: "Master's Program", points: 0, maxPoints: 0, weight: '30%' },
    { label: 'D.1', title: 'MA/MS Units (6-12 units)', points: 47.0, maxPoints: 47.0, weight: '30%' },
    { label: 'D.2', title: 'MA/MS Units (13-18 units)', points: 49.0, maxPoints: 49.0, weight: '30%' },
    { label: 'D.3', title: 'MA/MS Units (19-24 units)', points: 51.0, maxPoints: 51.0, weight: '30%' },
    { label: 'D.4', title: 'MA/MS Units (25-30 units)', points: 53.0, maxPoints: 53.0, weight: '30%' },
    { label: 'D.5', title: 'MA/MS Units (31-up units)', points: 55.0, maxPoints: 55.0, weight: '30%' },
    { label: 'E', title: 'Comprehensive Exam Passed', points: 58.0, maxPoints: 58.0, weight: '30%' },
    { label: 'F', title: "Master's Degree (non-thesis)", points: 60.0, maxPoints: 60.0, weight: '30%' },
    { label: 'G', title: 'Thesis Defended', points: 62.0, maxPoints: 62.0, weight: '30%' },
    { label: 'H', title: "Master's Degree (Additional 2 points for another discipline)", points: 65.0, maxPoints: 65.0, weight: '30%' },
    { label: 'I', title: 'LLB and MD (Passed the bar and board exam)', points: 65.0, maxPoints: 65.0, weight: '30%' },
    { label: 'J', title: 'Doctoral Program', points: 0, maxPoints: 0, weight: '30%' },
    { label: 'J.1', title: 'Doctoral Units (9-18 units)', points: 67.0, maxPoints: 67.0, weight: '30%' },
    { label: 'J.2', title: 'Doctoral Units (19-27 units)', points: 69.0, maxPoints: 69.0, weight: '30%' },
    { label: 'J.3', title: 'Doctoral Units (28-36 units)', points: 71.0, maxPoints: 71.0, weight: '30%' },
    { label: 'J.4', title: 'Doctoral Units (37-45 units)', points: 73.0, maxPoints: 73.0, weight: '30%' },
    { label: 'J.5', title: 'Doctoral Units (46-up units)', points: 75.0, maxPoints: 75.0, weight: '30%' },
    { label: 'K', title: 'Comprehensive Exam Passed', points: 80.0, maxPoints: 80.0, weight: '30%' },
    { label: 'L', title: 'Doctorate Degree (Additional 5 points for another discipline)', points: 85.0, maxPoints: 85.0, weight: '30%' },
  ],
  2: null,
  3: null,
  4: null,
  5: null,
  6: null,
  7: null,
  8: null,
  9: null,
  10: null,
};

export function FacultyInfoCard({ facultyData, applicationData, onEditFinalScore, isEditingFinalScore, draftScore, onDraftScoreChange, onSaveFinalScore, isSavingFinalScore }) {
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
          <div className="fi-field"><label>Current Salary</label><span>₱{facultyData.current_salary ? Number(facultyData.current_salary).toLocaleString('en-PH', { minimumFractionDigits: 2 }) : 'N/A'}</span></div>
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
                  style={{ padding: '4px 8px', background: '#dbeafe', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '4px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
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
                  style={{ padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '13px', width: '80px' }}
                />
                <button
                  onClick={() => onSaveFinalScore()}
                  disabled={isSavingFinalScore}
                  style={{ padding: '6px 10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', opacity: isSavingFinalScore ? 0.6 : 1 }}
                >
                  {isSavingFinalScore ? 'Saving...' : 'Save'}
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

export function DocumentViewer({ fileUrl, fileName, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!fileUrl) return null;

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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: isFullscreen ? '95vw' : '90vw', height: isFullscreen ? '95vh' : '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9fafb' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', color: '#1f2937', fontSize: '14px', fontWeight: '600' }}>{fileName || 'Document Viewer'}</h3>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '12px' }}>{isPDF ? 'PDF Document' : 'Document'}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new tab"
              style={{ padding: '8px 12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'background 0.2s' }}
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
              style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: isDownloading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', transition: 'background 0.2s', opacity: isDownloading ? 0.6 : 1 }}
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
              style={{ padding: '8px 12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.2s' }}
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
              style={{ padding: '8px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.2s' }}
              onMouseEnter={(e) => e.target.style.background = '#dc2626'}
              onMouseLeave={(e) => e.target.style.background = '#ef4444'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px' }}>
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', background: '#f3f4f6' }}>
          {isPDF ? (
            <iframe src={`${fileUrl}#toolbar=1&navpanes=0&scrollbar=1`} style={{ width: '100%', height: '100%', border: 'none' }} title={fileName} />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', color: '#6b7280' }}>
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

export function ScoringCriteriaPanel({ area, submission, criteria, onClose, areaEvalData, onSaveCriteriaScores, isSavingScore }) {
  const buildCriteriaFromRubric = (areaId, partId, areaName) => {
    try {
      // Try to extract area code from areaName (e.g., "AREA II" -> 2)
      let resolvedAreaId = areaId;
      if (areaName) {
        const match = areaName.match(/AREA\s+([IVX]+)/i);
        if (match) {
          const romanNum = match[1].toUpperCase();
          const romanToNum = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
          resolvedAreaId = romanToNum[romanNum] || areaId;
        }
      }

      const areaRubric = RANKING_RUBRICS.find((r) => Number(r.areaId) === Number(resolvedAreaId));
      if (!areaRubric) return [];

      const normalizePart = (p) => {
        if (!p) return null;
        const cleaned = String(p).trim();
        const parts = cleaned.split(/[-_\s\/]+/);
        return parts[parts.length - 1];
      };

      const partLabel = normalizePart(partId);
      const subArea = partLabel
        ? areaRubric.subAreas.find((sa) => sa.label === partLabel || String(sa.id).endsWith(`_${partLabel}`) || String(sa.id).includes(`_${partLabel}_`))
        : null;

      const items = [];

      if (subArea) {
        if (subArea.children && subArea.children.length > 0) {
          subArea.children.forEach((c) => items.push({ criterion_key: c.label, label: c.label, title: c.title || c.label, maxPoints: Number(c.maxPoints ?? 0), score: 0 }));
        } else {
          items.push({ criterion_key: subArea.label, label: subArea.label, title: subArea.title || subArea.label, maxPoints: Number(subArea.maxPoints ?? 0), score: 0 });
        }
        return items;
      }

      // Flatten top-level subareas and children
      areaRubric.subAreas.forEach((sa) => {
        if (sa.children && sa.children.length > 0) {
          sa.children.forEach((c) => items.push({ criterion_key: c.label, label: c.label, title: c.title || c.label, maxPoints: Number(c.maxPoints ?? 0), score: 0 }));
        } else {
          items.push({ criterion_key: sa.label, label: sa.label, title: sa.title || sa.label, maxPoints: Number(sa.maxPoints ?? 0), score: 0 });
        }
      });

      return items;
    } catch (err) {
      console.error('Error building rubric criteria', err);
      return [];
    }
  };

  const fallbackCriteria = buildCriteriaFromRubric(area?.area_id || 1, submission?.part_id, area?.area_name || area?.label);
  const getRubricMaxForCriterion = (areaId, criterionKey, partId, areaName) => {
    try {
      // Extract area code from areaName (e.g., "AREA II" -> 2)
      let resolvedAreaId = areaId;
      if (areaName) {
        const match = areaName.match(/AREA\s+([IVX]+)/i);
        if (match) {
          const romanNum = match[1].toUpperCase();
          const romanToNum = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10 };
          resolvedAreaId = romanToNum[romanNum] || areaId;
        }
      }

      const areaRubric = RANKING_RUBRICS.find((r) => Number(r.areaId) === Number(resolvedAreaId));
      if (!areaRubric) return 0;
      const normalize = (str) => String(str || '').trim().toLowerCase().replace(/[^\w]/g, '');
      const partLabel = partId ? String(partId).trim().split(/[-_\s\/]+/).pop() : null;
      const normalizedKey = normalize(criterionKey);

      const findInList = (list) => {
        for (const item of list) {
          if (!item) continue;
          if (String(item.label) === String(criterionKey) || String(item.id).endsWith(`_${criterionKey}`) || String(item.id).includes(`_${criterionKey}_`)) {
            return Number(item.maxPoints ?? 0);
          }
          if (normalize(item.label) === normalizedKey || normalize(item.title) === normalizedKey || normalize(item.id) === normalizedKey) {
            return Number(item.maxPoints ?? 0);
          }
          if (item.children && item.children.length) {
            const res = findInList(item.children);
            if (res) return res;
          }
        }
        return 0;
      };

      if (partLabel) {
        const subArea = areaRubric.subAreas.find((sa) => sa.label === partLabel || String(sa.id).endsWith(`_${partLabel}`) || String(sa.id).includes(`_${partLabel}_`));
        if (subArea) {
          const v = findInList([subArea]);
          if (v) return v;
        }
      }

      const result = findInList(areaRubric.subAreas);
      if (result) return result;

      for (const area of RANKING_RUBRICS) {
        const crossSearchResult = findInList(area.subAreas);
        if (crossSearchResult) return crossSearchResult;
      }

      return 0;
    } catch (err) {
      console.error('rubric lookup error', err);
      return 0;
    }
  };

  const activeCriteria = (criteria && criteria.length > 0 ? criteria : fallbackCriteria).map((criterion) => {
    const key = criterion.criterion_key || criterion.label;
    const providedMax = Number(criterion.maxPoints ?? criterion.max_points ?? criterion.max ?? 0);
    const rubricMax = getRubricMaxForCriterion(area?.area_id || 1, key, submission?.part_id, area?.area_name || area?.label);
    const finalMax = providedMax > 0 ? providedMax : (rubricMax > 0 ? rubricMax : 0);

    const parsedScore = Number(criterion.score ?? 0);
    const excess = Number(criterion.excessScore ?? criterion.excess_score ?? Math.max(0, parsedScore - finalMax));

    return {
      criterion_key: key,
      label: criterion.label || key || 'Unnamed Criterion',
      title: criterion.title || key || criterion.label || '',
      maxPoints: finalMax,
      score: parsedScore,
      excessScore: excess,
    };
  });

  const [draftCriteriaScores, setDraftCriteriaScores] = useState(activeCriteria);
  const [partSubmissions, setPartSubmissions] = useState({});
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [viewerModalFile, setViewerModalFile] = useState(null);
  const skipAutoSaveRef = useRef(true);
  const lastSaveTimeRef = useRef(0);

  // Fetch existing criterion scores from database
  useEffect(() => {
    const fetchCriterionScores = async () => {
      if (!submission?.submission_id || String(submission?.submission_id)?.startsWith('placeholder-')) {
        setDraftCriteriaScores(activeCriteria);
        return;
      }

      try {
        console.log('[ScoringCriteriaPanel] Fetching criterion scores for submission:', submission.submission_id);
        const { data: dbScores, error } = await supabase
          .from('area_submission_criterion_scores')
          .select('*')
          .eq('submission_id', submission.submission_id);

        if (error) {
          console.warn('[ScoringCriteriaPanel] Error fetching criterion scores:', error);
          setDraftCriteriaScores(activeCriteria);
          return;
        }

        // Create map of criterion_key -> score data
        const scoreMap = {};
        dbScores?.forEach(s => {
          scoreMap[s.criterion_key] = {
            score: Number(s.score || 0),
            excessScore: Number(s.excess_score || 0),
            cappedScore: Number(s.capped_score || 0),
          };
        });

        console.log('[ScoringCriteriaPanel] Built scoreMap:', scoreMap);

        // Merge database scores with criteria
        const mergedCriteria = activeCriteria.map(criterion => ({
          ...criterion,
          score: scoreMap[criterion.criterion_key]?.score ?? criterion.score ?? 0,
          excessScore: scoreMap[criterion.criterion_key]?.excessScore ?? criterion.excessScore ?? 0,
          cappedScore: scoreMap[criterion.criterion_key]?.cappedScore ?? 0,
        }));

        setDraftCriteriaScores(mergedCriteria);
      } catch (err) {
        console.error('[ScoringCriteriaPanel] Error fetching criterion scores:', err);
        setDraftCriteriaScores(activeCriteria);
      }
    };

    fetchCriterionScores();
  }, [submission?.submission_id]);

  // Fetch all part submissions for this area
  useEffect(() => {
    const fetchPartSubmissions = async () => {
      if (!submission?.area_id || String(submission?.submission_id)?.startsWith('placeholder-')) {
        console.log('[ScoringCriteriaPanel] Skipping fetch: placeholder or no area_id');
        setPartSubmissions({});
        return;
      }
      
      try {
        console.log('[ScoringCriteriaPanel] Fetching partSubmissions:', {
          area_id: submission?.area_id,
          application_id: submission?.application_id,
          submission_id: submission?.submission_id,
        });
        
        const { data: submissions, error } = await supabase
          .from('area_submissions')
          .select('*')
          .eq('application_id', submission?.application_id)
          .eq('area_id', submission?.area_id);

        console.log('[ScoringCriteriaPanel] Supabase query result:', { submissions, error });

        if (error) {
          console.error('[ScoringCriteriaPanel] Supabase error:', error);
          return;
        }

        // Map submissions by part_id
        const partMap = {};
        submissions?.forEach(sub => {
          console.log('[ScoringCriteriaPanel] Processing submission:', { part_id: sub.part_id, file_path: sub.file_path });
          if (sub.part_id && sub.file_path) {
            partMap[sub.part_id] = sub.file_path;
          }
        });
        console.log('[ScoringCriteriaPanel] Built partMap:', partMap);
        setPartSubmissions(partMap);
      } catch (err) {
        console.error('[ScoringCriteriaPanel] Error fetching part submissions:', err);
      }
    };

    fetchPartSubmissions();
  }, [submission?.area_id, submission?.application_id]);

  useEffect(() => {
    // Only reset if we have a new submission ID (don't reset on criteria changes as that's handled by the fetch above)
    skipAutoSaveRef.current = true;
  }, [submission?.submission_id]);

  useEffect(() => {
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return undefined;
    }

    // Do not autosave for placeholder submissions (local-only entries)
    const sid = submission?.submission_id;
    if (!sid || !onSaveCriteriaScores) return undefined;
    if (typeof sid === 'string' && sid.startsWith('placeholder-')) {
      // skip autosave for placeholders
      return undefined;
    }

    // Prevent autosave within 1 second of last save to avoid rapid loops
    const now = Date.now();
    if (now - lastSaveTimeRef.current < 1000) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      lastSaveTimeRef.current = Date.now();
      onSaveCriteriaScores(submission.submission_id, draftCriteriaScores);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [draftCriteriaScores, submission?.submission_id, onSaveCriteriaScores]);

  const totalCriteriaScore = draftCriteriaScores.reduce((sum, criterion) => sum + Number(criterion.score || 0), 0);
  const totalExcessScore = draftCriteriaScores.reduce((sum, criterion) => sum + Number(criterion.excessScore || 0), 0);
  // Prefer explicit area maxPoints, fall back to area.max, area.max_possible_points, then sum of criteria maxPoints
  const summedCriteriaMax = draftCriteriaScores.reduce((s, c) => s + Number(c.maxPoints || 0), 0);
  const maxCriteriaScore = Number(area?.maxPoints ?? area?.max ?? area?.max_possible_points ?? summedCriteriaMax ?? 0);

  // DEBUG: log area and computed max values to trace incorrect display
  useEffect(() => {
    console.log('[ScoringCriteriaPanel] area object:', area);
    console.log('[ScoringCriteriaPanel] summedCriteriaMax:', summedCriteriaMax, 'maxCriteriaScore:', maxCriteriaScore);
    console.log('[ScoringCriteriaPanel] draftCriteriaScores sample:', draftCriteriaScores.slice(0, 6));
  }, [area, summedCriteriaMax, maxCriteriaScore, draftCriteriaScores]);

  const handleCriterionChange = (criterionKey, value) => {
    // Coerce empty or invalid entries to 0 to avoid backend validation errors
    const parsed = (value === null || value === undefined || String(value).trim() === '') ? 0 : Number(value);
    const normalized = Number.isFinite(parsed) ? parsed : 0;

    setDraftCriteriaScores((prev) => prev.map((criterion) => (
      criterion.criterion_key === criterionKey
        ? { ...criterion, score: normalized, excessScore: Math.max(0, normalized - Number(criterion.maxPoints || 0)) }
        : criterion
    )));
  };

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
        <div className="pdf-no-submission"><p>Select an area to view scoring criteria and submitted documents</p></div>
      </div>
    );
  }

  return (
    <div className="pdf-panel">
      <div className="pdf-panel-header">
          <div className="pdf-panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>{area.label || area.area_name}</span>
        </div>
        <button className="close-btn" onClick={onClose} style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
      </div>

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

      {submission && !submission.is_placeholder && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Accumulated Criteria Score</div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>
                {totalCriteriaScore.toFixed(2)}
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', marginLeft: '8px' }}>/ {maxCriteriaScore > 0 ? maxCriteriaScore.toFixed(2) : '—'} pts</span>
              </div>
            </div>
          </div>

          {/* Total excess points (summed across criteria) shown below accumulated score */}
          <div style={{ marginTop: '8px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Total Excess Points</div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: totalExcessScore > 0 ? '#dc2626' : '#9ca3af' }}>
              {totalExcessScore > 0 ? `+${totalExcessScore.toFixed(2)}` : '0.00'}
            </div>
          </div>
        </div>
      )}

      {area.description && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontSize: '14px', color: '#666' }}>
          <strong>Description:</strong> {area.description}
        </div>
      )}

      {area.area_id && (CRITERIA_DEFINITIONS[area.area_id] || CRITERIA_DEFINITIONS[1]) && (
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>Evaluation Criteria</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #d1d5db', background: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '10px 8px', fontWeight: '700', color: '#374151' }}>Criteria / Title</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '700', color: '#374151', width: '80px' }}>Max Pts</th>
                <th style={{ textAlign: 'right', padding: '10px 8px', fontWeight: '700', color: '#374151', width: '110px' }}>Score</th>
                <th style={{ textAlign: 'center', padding: '10px 8px', fontWeight: '700', color: '#374151', width: '80px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {draftCriteriaScores.map((criterion, i) => {
                const paddingLeft = criterion.label && criterion.label.includes('.') ? '24px' : '8px';
                const hasMaxPoints = Number(criterion.maxPoints || 0) > 0;
                
                // Extract part letter from criterion label (e.g., "A.1" -> "A", "B.2" -> "B")
                const partLetter = criterion.label?.split('.')[0];
                
                // Construct full part_id by combining area's Roman numeral with letter (e.g., "I-C")
                let partSubmissionFile = null;
                if (partLetter && area?.label) {
                  // Extract Roman numeral from area label (e.g., "AREA I" -> "I")
                  const areaRomanMatch = area.label.match(/AREA\s+([IVX]+)/i);
                  const areaRoman = areaRomanMatch ? areaRomanMatch[1] : '';
                  const fullPartId = areaRoman ? `${areaRoman}-${partLetter}` : partLetter;
                  
                  // Try to find file using full part_id (e.g., "I-C"), then fallback to just letter
                  partSubmissionFile = partSubmissions[fullPartId] || partSubmissions[partLetter] || partSubmissions[`Part ${partLetter}`] || null;
                  
                  if (i === 0) {
                    console.log('[ScoringCriteriaPanel] File lookup for criterion 0:', {
                      partLetter,
                      'area.label': area.label,
                      areaRoman,
                      fullPartId,
                      partSubmissions,
                      partSubmissionFile,
                    });
                  }
                }

                return (
                  <tr key={`item-${i}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: `8px ${paddingLeft}`, color: '#1f2937', fontSize: '11px' }}>
                      <span style={{ fontWeight: '600', color: '#059669', marginRight: '6px' }}>{criterion.label}</span>
                      {criterion.title}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 8px', color: '#059669', fontWeight: '600' }}>
                      {hasMaxPoints ? criterion.maxPoints.toFixed(2) : '—'}
                    </td>
                    <td style={{ textAlign: 'right', padding: '8px 8px' }}>
                      {hasMaxPoints ? (
                        <input
                          id={`score-input-${criterion.criterion_key || i}`}
                          name={`score-${criterion.criterion_key || i}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={criterion.score}
                          onChange={(e) => handleCriterionChange(criterion.criterion_key, e.target.value)}
                          aria-label={`Score for ${criterion.label}: ${criterion.title}`}
                          style={{ width: '100px', padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', textAlign: 'right', background: 'white' }}
                        />
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center', padding: '8px 8px' }}>
                      {partSubmissionFile ? (
                        <button
                          type="button"
                          onClick={() => {
                            setViewerModalFile(partSubmissionFile);
                            setViewerModalOpen(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #3b82f6',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontSize: '11px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#dbeafe';
                            e.target.style.borderColor = '#1d4ed8';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#eff6ff';
                          }}
                        >
                          View File
                        </button>
                      ) : (
                        <span style={{ color: '#9ca3af', fontSize: '11px' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: '2px solid #d1d5db', background: '#f9fafb' }}>
                <td style={{ padding: '10px 8px', fontWeight: '700', color: '#1f2937' }}>TOTAL</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: '#059669' }}>{maxCriteriaScore.toFixed(2)}</td>
                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: '#111827' }}>{totalCriteriaScore.toFixed(2)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewerModalOpen && (
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
          zIndex: 10000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            width: '90%',
            height: '90vh',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Document Viewer
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const publicUrl = getPublicFileUrl(viewerModalFile);
                      const resp = await fetch(publicUrl);
                      if (!resp.ok) throw new Error('Failed to fetch file');
                      const blob = await resp.blob();
                      const url = window.URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = viewerModalFile?.split('/').pop() || 'document';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Download failed:', err);
                      alert('Unable to download file. Please try opening it in a new tab.');
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e5e7eb';
                    e.target.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  ↓ Download
                </button>
                <button
                  type="button"
                  onClick={() => setViewerModalOpen(false)}
                  style={{
                    fontSize: '24px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    padding: '0',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f9fafb' }}>
              {viewerModalFile && viewerModalFile.endsWith('.pdf') ? (
                <iframe
                  src={getPublicFileUrl(viewerModalFile)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Document Viewer"
                />
              ) : viewerModalFile ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666',
                }}>
                  <p>Preview not available for this file type.</p>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const publicUrl = getPublicFileUrl(viewerModalFile);
                        const resp = await fetch(publicUrl);
                        if (!resp.ok) throw new Error('Failed to fetch file');
                        const blob = await resp.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = viewerModalFile?.split('/').pop() || 'document';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Download failed:', err);
                        alert('Unable to download file. Please try opening it in a new tab.');
                      }
                    }}
                    style={{
                      color: '#0ea5e9',
                      textDecoration: 'underline',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                    }}
                  >
                    Click here to download the file
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AreaCard({ area, isExpanded, isSelected, draftScore, onToggle, onDraftChange, onSave, isSaving, onSelectArea }) {
  const [isHovered, setIsHovered] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [viewerModalFile, setViewerModalFile] = useState(null);
  const areaId = area.area_id || 1;
  const areaCriteria = CRITERIA_DEFINITIONS[areaId] || CRITERIA_DEFINITIONS[1];
  const summedCriteriaMax = (areaCriteria || []).reduce((s, c) => s + Number(c.maxPoints || c.points || 0), 0);
  const maxPoints = Number(area.maxPoints ?? area.max ?? summedCriteriaMax ?? 0);

  return (
    <div 
      className="area-card"
      onClick={() => onSelectArea(area)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        cursor: 'pointer',
        backgroundColor: isSelected ? '#ffffff' : (isHovered ? '#f0f9ff' : 'transparent'),
        border: isSelected ? '2px solid #0ea5e9' : (isHovered ? '1px solid #0ea5e9' : '1px solid #e5e7eb'),
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? '0 4px 16px rgba(14, 165, 233, 0.2)' : (isHovered ? '0 4px 12px rgba(14, 165, 233, 0.1)' : 'none'),
      }}
    >
      <div className="area-card-header">
        <div>
          <div className="area-card-title">{area.label}</div>
            <div className="area-card-meta" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span>Max: {maxPoints} pts</span>
            {area.file_path ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Open the side details panel for this area instead of opening a file modal
                  onSelectArea && onSelectArea(area);
                }}
                style={{ padding: '2px 8px', borderRadius: '999px', border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
              >
                View file
              </button>
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '11px' }}>No file</span>
            )}
          </div>
        </div>
        <div className="area-card-right">
          <span className="area-score">{area.score}</span>
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewerModalOpen && (
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
          zIndex: 10000,
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            width: '90%',
            height: '90vh',
            maxWidth: '1200px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                Document Viewer — {area.label}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    const publicUrl = getPublicFileUrl(viewerModalFile);
                    const link = document.createElement('a');
                    link.href = publicUrl;
                    link.download = viewerModalFile?.split('/').pop() || 'document';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e5e7eb';
                    e.target.style.borderColor = '#9ca3af';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3f4f6';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  ↓ Download
                </button>
                <button
                  type="button"
                  onClick={() => setViewerModalOpen(false)}
                  style={{
                    fontSize: '24px',
                    cursor: 'pointer',
                    background: 'none',
                    border: 'none',
                    color: '#6b7280',
                    padding: '0',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', background: '#f9fafb' }}>
              {viewerModalFile && viewerModalFile.endsWith('.pdf') ? (
                <iframe
                  src={getPublicFileUrl(viewerModalFile)}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  title="Document Viewer"
                />
              ) : viewerModalFile ? (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: '#666',
                }}>
                  <p>Preview not available for this file type.</p>
                  <a
                    href={getPublicFileUrl(viewerModalFile)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#0ea5e9',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Click here to download the file
                  </a>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SummaryView({ onBack, areaScores }) {
  return (
    <div className="summary-layout">
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
