import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './ranking.css';
import { supabase } from '../supabase';
import RankingAreaRow from './ranking/components/RankingAreaRow';

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
  const [previewArea, setPreviewArea] = useState(null);

  // On initial load, check Storage for any existing templates per area
  useEffect(() => {
    const bucket = 'documents';
    const roleFolder = 'Admin';

    const loadExistingFiles = async () => {
      const updatedAreas = [...areas];

      for (const area of updatedAreas) {
        const folderPath = `${roleFolder}/area-${area.id}`;

        const { data: files, error } = await supabase.storage
          .from(bucket)
          .list(folderPath, {
            limit: 1,
            sortBy: { column: 'created_at', order: 'desc' },
          });

        if (error || !files || files.length === 0) continue;

        const latest = files[0];
        const fullPath = `${folderPath}/${latest.name}`;

        const { data: signedData, error: signedError } = await supabase.storage
          .from(bucket)
          .createSignedUrl(fullPath, 60 * 60);

        if (signedError || !signedData?.signedUrl) continue;

        area.uploaded = true;
        area.fileName = latest.name;
        area.fileUrl = signedData.signedUrl;
      }

      setAreas(updatedAreas);
    };

    loadExistingFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleFileUpload = async (areaId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // File validation (PDF only)
    const allowedTypes = [
      'application/pdf',
    ];
    
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Please upload PDF files only.');
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

    // Upload to Supabase Storage
    // Bucket name must exist in your Supabase project (you named it "documents")
    const bucket = 'documents';
    const roleFolder = 'Admin'; // adjust later for VPAA / Faculty portals
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${roleFolder}/area-${areaId}/${Date.now()}-${safeName}`;

    const { data: uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file to Supabase Storage:', error);
      alert('Failed to upload file. Please try again.');
      event.target.value = '';
      return;
    }

    // For a private bucket, use a signed URL instead of a public URL
    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uploadData.path, 60 * 60); // 1 hour

    if (signedError) {
      console.error('Error creating signed URL for file:', signedError);
      alert('File uploaded, but failed to create a view link. Please try again.');
      return;
    }

    const fileUrl = signedData?.signedUrl ?? '';

    // Save rubric template to database so it's available to all faculty applications in review
    try {
      const areaToUpdate = areas.find(a => a.id === areaId);
      console.log('💾 Attempting to save rubric to database...', { areaId, fileUrl: fileUrl.substring(0, 50) + '...' });
      
      const { error: updateError } = await supabase
        .from('areas')
        .update({
          template_file_path: fileUrl
        })
        .eq('area_id', areaId);

      if (updateError) {
        console.error('❌ Error saving rubric to database:', updateError);
        console.error('Database error details:', {
          code: updateError.code,
          message: updateError.message,
          details: updateError.details
        });
        alert('File uploaded to storage, but failed to save to database. Please try again.');
        return;
      }

      console.log('✅ Rubric template saved to database for area', areaId);
    } catch (dbError) {
      console.error('❌ Database save error:', dbError);
      alert('File uploaded, but failed to register in system. Please try again.');
      return;
    }

    setAreas(prevAreas => 
      prevAreas.map(area => 
        area.id === areaId 
          ? { ...area, uploaded: true, fileName: file.name, fileUrl }
          : area
      )
    );
    alert(`✅ File "${file.name}" uploaded successfully for ${areas.find(a => a.id === areaId)?.title}\n📢 This template is now available to all faculty in Review & Score`);

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

  const handleViewFile = (area) => {
    if (!area.fileUrl) {
      alert('No file is available to view for this area. Please upload a PDF first.');
      return;
    }
    setPreviewArea(area);
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
                  <RankingAreaRow
                    key={area.id}
                    area={area}
                    isEditing={isEditing}
                    editDescription={editDescription}
                    setEditDescription={setEditDescription}
                    onFileUpload={handleFileUpload}
                    onUploadClick={handleUploadClick}
                    onViewFile={handleViewFile}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onEdit={handleEdit}
                    toRoman={toRoman}
                    icons={{
                      UploadIcon,
                      CheckCircleIcon,
                      ResubmitIcon,
                      SaveIcon,
                      EditIcon,
                    }}
                  />
                );
              })}
            </tbody>
          </table>

          {previewArea && (
            <div
              className="rk-preview-overlay"
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
              }}
              onClick={() => setPreviewArea(null)}
            >
              <div
                className="rk-preview-modal"
                style={{
                  background: '#fff',
                  borderRadius: 8,
                  width: '95%',
                  height: '90%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="rk-preview-header"
                  style={{
                    padding: '10px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Template Preview</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {previewArea?.title} {previewArea?.fileName ? `- ${previewArea.fileName}` : ''}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="rk-preview-close"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                    onClick={() => setPreviewArea(null)}
                  >
                    ×
                  </button>
                </div>
                <div style={{ flex: 1 }}>
                  {previewArea?.fileUrl ? (
                    <iframe
                      src={previewArea.fileUrl}
                      title="Template Preview"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    />
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                      }}
                    >
                      No file to preview.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}