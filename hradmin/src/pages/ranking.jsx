import React, { useState } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './ranking.css';

/* ── Icons ───────────────────────────────── */
const UploadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16"/>
    <line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>
);

const ResubmitIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <polyline points="1 20 1 14 7 14"/>
    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
  </svg>
);

/* ── Data ────────────────────────────────── */
const rankingAreas = [
  {
    id: 1,
    title: 'AREA I: EDUCATIONAL QUALIFICATIONS',
    description: 'Evaluation of academic degrees, diplomas, certifications, and relevant educational attainment of faculty members.',
    uploaded: false,
    points: 85.00,
  },
  {
    id: 2,
    title: 'AREA II: RESEARCH AND PUBLICATIONS',
    description: 'Assessment of published research papers, journal articles, books, monographs, and other scholarly works.',
    uploaded: false,
    points: 20.00,
  },
  {
    id: 3,
    title: 'AREA III: TEACHING EXPERIENCE AND PROFESSIONAL SERVICES',
    description: 'Evaluation of years of teaching, mentoring, academic advising, and professional service contributions.',
    uploaded: false,
    points: 20.00,
  },
  {
    id: 4,
    title: 'AREA IV: PERFORMANCE EVALUATION',
    description: 'Review of faculty performance ratings, student feedback, peer evaluations, and administrative assessments.',
    uploaded: false,
    points: 10.00,
  },
  {
    id: 5,
    title: 'AREA V: TRAINING AND SEMINARS',
    description: 'Participation in workshops, seminars, conferences, and continuing professional development activities.',
    uploaded: false,
    points: 10.00,
  },
  {
    id: 6,
    title: 'AREA VI: EXPERT SERVICES RENDERED',
    description: 'Consultancy work, technical assistance, resource speaking, and specialized services provided to external organizations.',
    uploaded: false,
    points: 20.00,
  },
  {
    id: 7,
    title: 'AREA VII: INVOLVEMENT IN PROFESSIONAL ORGANIZATIONS',
    description: 'Active participation and membership in professional associations, societies, and organizations related to the field.',
    uploaded: false,
    points: 10.00,
  },
  {
    id: 8,
    title: 'AREA VIII: AWARDS OF DISTINCTION RECEIVED IN RECOGNITION OF ACHIEVEMENTS IN RELEVANT AREAS OF SPECIALIZATION/PROFESSION AND/OR ASSIGNMENT OF FACULTY CONCERNED',
    description: 'Recognition, honors, awards, and distinctions received for professional excellence and contributions.',
    uploaded: false,
    points: 10.00,
  },
  {
    id: 9,
    title: 'AREA IX: COMMUNITY OUTREACH',
    description: 'Engagement in community service, outreach programs, and extension activities that benefit society.',
    uploaded: false,
    points: 5.00,
  },
  {
    id: 10,
    title: 'AREA X: PROFESSIONAL EXAMINATION (PRC, CSC AND TESDA)',
    description: 'Professional licenses, certifications, and examination results from regulatory bodies and professional councils.',
    uploaded: false,
    points: 10.00,
  },
];

/* ── Helper Functions ────────────────────── */
const toRoman = (num) => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  return romanNumerals[num - 1] || num.toString();
};

/* ── Page ────────────────────────────────── */
export default function Ranking() {
  const [areas, setAreas] = useState(rankingAreas);
  const [editingId, setEditingId] = useState(null);
  const [editDescription, setEditDescription] = useState('');

  const handleEdit = (area) => {
    setEditingId(area.id);
    setEditDescription(area.description);
  };

  const handleSave = (areaId) => {
    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId 
          ? { ...area, description: editDescription }
          : area
      )
    );
    setEditingId(null);
    setEditDescription('');
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditDescription('');
  };

  const handleFileUpload = (areaId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF, DOC, DOCX, or image files only.');
      return;
    }

    if (file.size > maxSize) {
      alert('File size too large. Please upload files smaller than 5MB.');
      return;
    }

    console.log(`📁 File selected for Area ${areaId}:`, {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    });

    // TODO: Implement actual file upload to cloud storage
    // For now, just simulate successful upload
    setTimeout(() => {
      setAreas(prevAreas => 
        prevAreas.map(area => 
          area.id === areaId 
            ? { ...area, uploaded: true, fileName: file.name }
            : area
        )
      );
      alert(`✅ File "${file.name}" uploaded successfully for ${areas.find(a => a.id === areaId)?.title}`);
    }, 1000);

    // Reset file input
    event.target.value = '';
  };

  const handleUploadClick = (areaId) => {
    // Trigger file input click
    const fileInput = document.getElementById(`file-input-${areaId}`);
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="content">

          {/* Title row */}
          <div className="rk-card-header">
            <span className="rk-card-title">Ranking Rubrics</span>
            <span className="rk-semester">1st Semester AY 2026–2027</span>
          </div>

          {/* Table */}
          <table className="rk-table">
            <colgroup>
              <col className="rk-col-num" />
              <col className="rk-col-title" />
              <col className="rk-col-desc" />
              <col className="rk-col-template" />
              <col className="rk-col-points" />
              <col className="rk-col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th className="rk-th" style={{ textAlign: 'center' }}>AREA</th>
                <th className="rk-th">Title</th>
                <th className="rk-th">Description</th>
                <th className="rk-th" style={{ textAlign: 'center' }}>Template</th>
                <th className="rk-th" style={{ textAlign: 'right' }}>Points</th>
                <th className="rk-th" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => {
                const isEditing = editingId === area.id;
                return (
                  <tr key={area.id} className="rk-row">
                    <td className="rk-td rk-td-num">{toRoman(area.id)}</td>
                    <td className="rk-td rk-td-title">{area.title}</td>
                    <td className="rk-td rk-td-desc">
                      {isEditing ? (
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          className="rk-edit-textarea"
                          rows={3}
                        />
                      ) : (
                        area.description
                      )}
                    </td>
                    <td className="rk-td rk-td-template">
                      {/* Hidden file input */}
                      <input
                        type="file"
                        id={`file-input-${area.id}`}
                        style={{ display: 'none' }}
                        onChange={(e) => handleFileUpload(area.id, e)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      />
                      
                      {area.uploaded ? (
                        <span className={`rk-badge ${isEditing ? 'resubmit' : 'uploaded'}`}>
                          {isEditing ? (
                            <>
                              <ResubmitIcon /> 
                              <span 
                                className="rk-badge-clickable"
                                onClick={() => handleUploadClick(area.id)}
                              >
                                Resubmit
                              </span>
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon /> 
                              {area.fileName || 'Uploaded'}
                            </>
                          )}
                        </span>
                      ) : (
                        <span 
                          className="rk-badge upload rk-badge-clickable"
                          onClick={() => handleUploadClick(area.id)}
                        >
                          <UploadIcon /> Upload
                        </span>
                      )}
                    </td>
                    <td className="rk-td rk-td-points">{area.points.toFixed(2)}</td>
                    <td className="rk-td rk-td-actions">
                      {isEditing ? (
                        <div className="rk-edit-actions">
                          <button 
                            className="rk-save-btn" 
                            title="Save"
                            onClick={() => handleSave(area.id)}
                          >
                            <SaveIcon />
                          </button>
                          <button 
                            className="rk-cancel-btn" 
                            title="Cancel"
                            onClick={handleCancel}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="rk-edit-btn" 
                          title="Edit"
                          onClick={() => handleEdit(area)}
                        >
                          <EditIcon />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
}