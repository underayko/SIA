import React from 'react';
import Sidebar from '../components/sidenav';
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

/* ── Data ────────────────────────────────── */
const rankingAreas = [
  {
    id: 1,
    title: 'Educational Qualifications',
    description: 'Evaluation of academic degrees, diplomas, certifications, and relevant educational attainment of faculty members.',
    uploaded: true,
    points: 85.00,
  },
  {
    id: 2,
    title: 'Research and Publications',
    description: 'Assessment of published research papers, journal articles, books, monographs, and other scholarly works.',
    uploaded: true,
    points: 20.00,
  },
  {
    id: 3,
    title: 'Teaching Experience and Professional Services',
    description: 'Evaluation of years of teaching, mentoring, academic advising, and professional service contributions.',
    uploaded: false,
    points: 20.00,
  },
  {
    id: 4,
    title: 'Performance Evaluation',
    description: 'Review of faculty performance ratings, student feedback, peer evaluations, and administrative assessments.',
    uploaded: true,
    points: 10.00,
  },
  {
    id: 5,
    title: 'Training and Seminars',
    description: 'Participation in workshops, seminars, conferences, and continuing professional development activities.',
    uploaded: false,
    points: 10.00,
  },
  {
    id: 6,
    title: 'Expert Services Rendered',
    description: 'Consultancy work, technical assistance, resource speaking, and specialized services provided to external organizations.',
    uploaded: true,
    points: 20.00,
  },
];

/* ── Page ────────────────────────────────── */
export default function Ranking() {
  return (
    <div className="rk-layout">
      <Sidebar />

      <main className="rk-main">
        <div className="rk-body">

          {/* Title row */}
          <div className="rk-card-header">
            <span className="rk-card-title">Ranking Criteria</span>
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
                <th className="rk-th" style={{ textAlign: 'center' }}>Area #</th>
                <th className="rk-th">Title</th>
                <th className="rk-th">Description</th>
                <th className="rk-th" style={{ textAlign: 'center' }}>Template</th>
                <th className="rk-th" style={{ textAlign: 'right' }}>Points</th>
                <th className="rk-th" style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rankingAreas.map((area) => (
                <tr key={area.id} className="rk-row">
                  <td className="rk-td rk-td-num">{area.id}</td>
                  <td className="rk-td rk-td-title">{area.title}</td>
                  <td className="rk-td rk-td-desc">{area.description}</td>
                  <td className="rk-td rk-td-template">
                    {area.uploaded ? (
                      <span className="rk-badge uploaded">
                        <CheckCircleIcon /> Uploaded
                      </span>
                    ) : (
                      <span className="rk-badge upload">
                        <UploadIcon /> Upload
                      </span>
                    )}
                  </td>
                  <td className="rk-td rk-td-points">{area.points.toFixed(2)}</td>
                  <td className="rk-td rk-td-actions">
                    <button className="rk-edit-btn" title="Edit">
                      <EditIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </main>
    </div>
  );
}