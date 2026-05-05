import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './ranking.css';
import { supabase } from '../supabase';
import { RANKING_RUBRICS } from '../data/rankingRubrics';

const UploadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ViewIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export default function Ranking() {
  const [expandedArea, setExpandedArea] = useState(1);
  const [uploadedTemplates, setUploadedTemplates] = useState({});
  const [previewTemplate, setPreviewTemplate] = useState(null);

  useEffect(() => {
    const loadTemplates = async () => {
      const bucket = 'documents';
      const roleFolder = 'Admin';
      const templates = {};

      for (const area of RANKING_RUBRICS) {
        for (const subArea of area.subAreas) {
          const folderPath = `${roleFolder}/area-${area.areaId}/sub-${subArea.id}`;

          try {
            const { data: files } = await supabase.storage
              .from(bucket)
              .list(folderPath, { limit: 1, sortBy: { column: 'created_at', order: 'desc' } });

            if (files && files.length > 0) {
              const latest = files[0];
              const fullPath = `${folderPath}/${latest.name}`;
              const { data: signedData } = await supabase.storage
                .from(bucket)
                .createSignedUrl(fullPath, 60 * 60);

              if (signedData?.signedUrl) {
                templates[`${area.areaId}-${subArea.id}`] = {
                  fileName: latest.name,
                  fileUrl: signedData.signedUrl,
                };
              }
            }
          } catch (error) {
            console.error(`Error loading template for ${area.areaId}-${subArea.id}:`, error);
          }
        }
      }

      setUploadedTemplates(templates);
    };

    loadTemplates();
  }, []);

  const handleFileUpload = async (areaId, subAreaId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Invalid file type. Please upload PDF files only.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size too large. Please upload files smaller than 5MB.');
      return;
    }

    const bucket = 'documents';
    const roleFolder = 'Admin';
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const path = `${roleFolder}/area-${areaId}/sub-${subAreaId}/${Date.now()}-${safeName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      const { data: signedData, error: signedError } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60);

      if (signedError) throw signedError;

      setUploadedTemplates((prev) => ({
        ...prev,
        [`${areaId}-${subAreaId}`]: {
          fileName: file.name,
          fileUrl: signedData.signedUrl,
        },
      }));

      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      event.target.value = '';
    }
  };

  const handleUploadClick = (areaId, subAreaId) => {
    const fileInput = document.getElementById(`file-input-${areaId}-${subAreaId}`);
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="content">
          <div className="rk-hero">
            <div>
              <p className="rk-eyebrow">Rubrics Administration</p>
              <h1 className="rk-page-title">Ranking Rubrics</h1>
              <p className="rk-page-subtitle">Manage rubric sections and upload templates per sub-area.</p>
            </div>
            <div className="rk-hero-meta">
              <span className="rk-semester">1st Semester AY 2026–2027</span>
              <span className="rk-chip">{RANKING_RUBRICS.length} areas</span>
            </div>
          </div>

          <div className="rk-section-list">
            {RANKING_RUBRICS.map((area) => {
              const isExpanded = expandedArea === area.areaId;

              return (
                <section key={area.areaId} className="rk-area-section">
                  <button
                    type="button"
                    className="rk-area-head"
                    onClick={() => setExpandedArea(isExpanded ? null : area.areaId)}
                  >
                    <div>
                      <div className="rk-area-code">AREA {area.areaCode}</div>
                      <h2 className="rk-area-title">{area.areaName}</h2>
                    </div>

                    <div className="rk-area-head-right">
                      <div className="rk-area-points">{area.maxPoints} pts</div>
                      <div className={`rk-chevron ${isExpanded ? 'is-open' : ''}`}>
                        <ChevronDownIcon />
                      </div>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="rk-area-body">
                      {area.subAreas.map((subArea) => {
                        const templateKey = `${area.areaId}-${subArea.id}`;
                        const template = uploadedTemplates[templateKey];
                        const hasTemplate = Boolean(template);

                        return (
                          <div key={subArea.id} className="rk-subarea-card">
                            <div className="rk-subarea-copy">
                              <div className="rk-subarea-label">{subArea.label}</div>
                              <div className="rk-subarea-title">{subArea.title}</div>
                              {subArea.maxPoints != null && (
                                <div className="rk-subarea-meta">Max: <strong>{subArea.maxPoints}</strong> pts</div>
                              )}
                            </div>

                            <input
                              type="file"
                              id={`file-input-${area.areaId}-${subArea.id}`}
                              style={{ display: 'none' }}
                              onChange={(e) => handleFileUpload(area.areaId, subArea.id, e)}
                              accept=".pdf"
                            />

                            <div className="rk-subarea-actions">
                              {hasTemplate ? (
                                <>
                                  <span className="rk-file-pill">
                                    <CheckCircleIcon />
                                    {template.fileName}
                                  </span>
                                  <button
                                    type="button"
                                    className="rk-action-button rk-action-button--primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewTemplate(template);
                                    }}
                                  >
                                    <ViewIcon /> View
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="rk-action-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUploadClick(area.areaId, subArea.id);
                                  }}
                                >
                                  <UploadIcon /> Upload
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {previewTemplate && (
            <div
              style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}
              onClick={() => setPreviewTemplate(null)}
            >
              <div
                style={{ width: 'min(1100px, 100%)', height: 'min(90vh, 900px)', background: '#fff', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: '#0f172a' }}>Template Preview</div>
                    <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {previewTemplate.fileName}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    style={{ border: 'none', background: '#ef4444', color: '#fff', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
                  >
                    Close
                  </button>
                </div>

                <div style={{ flex: 1, background: '#f8fafc' }}>
                  <iframe
                    src={`${previewTemplate.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                    title={previewTemplate.fileName}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
