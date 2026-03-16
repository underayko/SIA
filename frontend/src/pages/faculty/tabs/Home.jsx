// 📄 SIA/frontend/src/pages/faculty/tabs/Home.jsx

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Lock,
    Trophy,
    Send,
    FileText,
    Eye,
    Download,
    RefreshCw,
    Paperclip,
    Bell,
    CheckCircle,
    School,
    Star,
    Building2,
    Clock,
    ArrowRight,
    Upload,
    X,
    Calendar,
    Megaphone,
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

  :root {
    --gc-green: #1a6b3c;
    --gc-green-dark: #134f2c;
    --gc-green-light: #228b4e;
    --gc-green-pale: #eef7f2;
    --gc-gold: #c9a84c;
    --gc-gold-light: #e8c96b;
    --gc-gold-pale: #fdf8ec;
    --white: #ffffff;
    --off-white: #f8f7f4;
    --surface: #f1f3f1;
    --text-dark: #1a1a1a;
    --text-mid: #3a4a3e;
    --text-muted: #6b7c70;
    --border: #dde5df;
    --danger: #c0392b;
    --danger-pale: #fdf0ee;
    --blue: #2471a3;
    --blue-pale: #eaf3fb;
  }

  /* ── HERO CARD ── */
  .hm-hero {
    background: linear-gradient(135deg, var(--gc-green-dark) 0%, var(--gc-green) 55%, #22704a 100%);
    border-radius: 16px; padding: 26px 28px;
    display: flex; align-items: center; justify-content: space-between; gap: 20px;
    margin-bottom: 20px; position: relative; overflow: hidden;
    box-shadow: 0 8px 32px rgba(26,107,60,0.22);
    animation: hmFadeUp 0.5s 0.1s ease both;
  }
  .hm-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:260px; height:260px; border-radius:50%;
    background:rgba(201,168,76,0.09); pointer-events:none;
  }
  .hm-hero-left { display:flex; align-items:center; gap:18px; position:relative; z-index:1; flex:1; min-width:0; }
  .hm-avatar {
    width:60px; height:60px; border-radius:50%;
    background:rgba(255,255,255,0.18); border:3px solid rgba(255,255,255,0.35);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    color: rgba(255,255,255,0.9);
  }
  .hm-hero-info { min-width: 0; }
  .hm-cycle-tag {
    font-size:10.5px; color:var(--gc-gold-light); letter-spacing:1.5px;
    text-transform:uppercase; font-weight:600; margin-bottom:4px;
  }
  .hm-name {
    font-family:'Playfair Display',serif; font-size:20px; color:var(--white);
    font-weight:600; margin-bottom:7px; line-height:1.2;
    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;
  }
  .hm-rank-flow { display:flex; align-items:center; gap:7px; margin-bottom:7px; flex-wrap:wrap; }
  .hm-rank-chip {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.22);
    border-radius:20px; padding:3px 11px; font-size:12px; color:var(--white); font-weight:500;
  }
  .hm-rank-chip.target {
    background:rgba(201,168,76,0.22); border-color:rgba(201,168,76,0.45); color:var(--gc-gold-light);
  }
  .hm-rank-arrow { color:rgba(255,255,255,0.45); display:flex; align-items:center; }
  .hm-status-pill {
    display:inline-flex; align-items:center; gap:5px;
    border-radius:12px; padding:3px 11px; font-size:11px; font-weight:600;
  }
  .hm-status-draft     { background:rgba(201,168,76,0.2); border:1px solid rgba(201,168,76,0.4); color:var(--gc-gold-light); }
  .hm-status-submitted { background:rgba(46,204,113,0.2); border:1px solid rgba(46,204,113,0.4); color:#7debb0; }
  .hm-dept-tag { font-size:12px; color:rgba(255,255,255,0.72); display:flex; align-items:center; gap:5px; }

  /* Deadline ring */
  .hm-hero-right { position:relative; z-index:1; text-align:center; flex-shrink:0; }
  .hm-deadline-ring { width:96px; height:96px; position:relative; margin:0 auto 7px; }
  .hm-deadline-ring svg { width:96px; height:96px; transform:rotate(-90deg); }
  .hm-ring-bg   { fill:none; stroke:rgba(255,255,255,0.12); stroke-width:7; }
  .hm-ring-fill { fill:none; stroke:var(--gc-gold); stroke-width:7; stroke-linecap:round;
    stroke-dasharray:251; stroke-dashoffset:63; }
  .hm-ring-center {
    position:absolute; inset:0;
    display:flex; flex-direction:column; align-items:center; justify-content:center;
  }
  .hm-ring-days       { font-size:20px; font-weight:700; color:var(--white); line-height:1; }
  .hm-ring-days-label { font-size:8px; color:rgba(255,255,255,0.55); letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
  .hm-deadline-label  { font-size:10px; color:rgba(255,255,255,0.6); }
  .hm-deadline-date   { font-size:12px; font-weight:600; color:var(--gc-gold-light); margin-top:2px; }

  /* ── SUBMIT ALL BAR ── */
  .hm-submit-bar {
    background:var(--white); border-radius:12px; border:1px solid var(--border);
    padding:16px 20px; margin-bottom:20px;
    display:flex; align-items:center; justify-content:space-between; gap:16px;
    box-shadow:0 2px 6px rgba(0,0,0,0.04);
    animation:hmFadeUp 0.5s 0.2s ease both;
  }
  .hm-submit-info h4 { font-size:14px; font-weight:600; color:var(--text-dark); margin-bottom:2px; }
  .hm-submit-info p  { font-size:12px; color:var(--text-muted); }
  .hm-prog-track { width:260px; margin-left:auto; margin-right:16px; flex-shrink:0; }
  .hm-prog-label { display:flex; justify-content:space-between; font-size:12px; color:var(--text-muted); margin-bottom:6px; font-weight:500; }
  .hm-prog-bar   { height:10px; background:#e0e8e2; border-radius:8px; overflow:hidden; }
  .hm-prog-fill  { height:100%; border-radius:8px; background:linear-gradient(90deg,var(--gc-green),var(--gc-green-light)); width:70%; }
  .hm-btn-submit-all {
    display:flex; align-items:center; gap:7px;
    padding:10px 20px;
    background:linear-gradient(135deg,var(--gc-green),var(--gc-green-light));
    color:var(--white); border:none; border-radius:9px;
    font-family:'Source Sans 3',sans-serif; font-size:13.5px; font-weight:600;
    cursor:pointer; transition:opacity 0.2s, transform 0.15s;
    box-shadow:0 4px 14px rgba(26,107,60,0.25); white-space:nowrap;
  }
  .hm-btn-submit-all:hover { opacity:0.9; transform:translateY(-1px); }

  /* ── CONTENT GRID ── */
  .hm-content-grid { display:grid; grid-template-columns:290px 1fr; gap:18px; margin-bottom:20px; }

  /* ── SCORE SIDEBAR ── */
  .hm-score-sidebar {
    background:var(--white); border-radius:14px; border:1px solid var(--border);
    padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.04);
    animation:hmFadeUp 0.5s 0.25s ease both;
    display:flex; flex-direction:column;
  }
  .hm-panel-header { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:16px; gap:8px; }
  .hm-panel-title  { font-family:'Playfair Display',serif; font-size:15px; font-weight:600; color:var(--text-dark); }
  .hm-panel-sub    { font-size:11.5px; color:var(--text-muted); margin-top:2px; }
  .hm-preview-btn  {
    font-size:10px; padding:3px 9px; border-radius:8px;
    border:1.5px solid var(--border); background:var(--off-white);
    cursor:pointer; color:var(--text-muted);
    font-family:'Source Sans 3',sans-serif; font-weight:600;
    display:flex; align-items:center; gap:4px; white-space:nowrap; flex-shrink:0;
  }

  /* Score locked */
  .hm-score-locked {
    background:var(--gc-green-pale); border:1px solid rgba(26,107,60,0.15);
    border-radius:10px; padding:14px 16px; margin-bottom:14px;
    display:flex; align-items:flex-start; gap:10px;
  }
  .hm-score-locked p { font-size:12.5px; color:var(--gc-green-dark); line-height:1.6; }

  /* Total score box */
  .hm-total-box {
    background:linear-gradient(135deg,var(--gc-green-dark),var(--gc-green));
    border-radius:12px; padding:18px; text-align:center; margin-bottom:14px;
  }
  .hm-ts-label { font-size:10px; color:rgba(255,255,255,0.6); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px; }
  .hm-ts-value { font-family:'Playfair Display',serif; font-size:28px; font-weight:700; color:var(--white); line-height:1; }
  .hm-ts-max   { font-size:11px; color:rgba(255,255,255,0.5); margin-top:5px; }

  /* Area score rows */
  .hm-area-scores { display:flex; flex-direction:column; gap:10px; }
  .hm-asr-top  { display:flex; align-items:center; justify-content:space-between; margin-bottom:4px; }
  .hm-asr-name { font-size:11.5px; color:var(--text-mid); font-weight:500; }
  .hm-asr-pts  { font-size:12px; font-weight:700; color:var(--gc-green-dark); }
  .hm-asr-hidden { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--text-muted); }
  .hm-asr-track { height:4px; background:var(--border); border-radius:4px; overflow:hidden; margin-bottom:2px; }
  .hm-asr-fill  { height:100%; border-radius:4px; background:linear-gradient(90deg,var(--gc-green),var(--gc-green-light)); transition:width 0.6s ease; }
  .hm-asr-max   { font-size:10.5px; color:var(--text-muted); }

  /* Reviewer comments */
  .hm-rcb { background:var(--off-white); border:1px solid var(--border); border-radius:10px; padding:12px 14px; margin-top:8px; }
  .hm-rcb-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
  .hm-rcb-avatar {
    width:28px; height:28px; border-radius:50%;
    display:flex; align-items:center; justify-content:center;
    font-size:10px; font-weight:700; color:var(--white); flex-shrink:0;
  }
  .hm-rcb-hr   { background:var(--gc-green); }
  .hm-rcb-vpaa { background:#8e44ad; }
  .hm-rcb-name  { font-size:12px; font-weight:600; color:var(--text-dark); }
  .hm-rcb-label { font-size:10.5px; color:var(--text-muted); }
  .hm-rcb-status { margin-left:auto; font-size:10px; font-weight:700; padding:2px 8px; border-radius:8px; }
  .hm-rcb-locked { background:#f0f0f0; color:#888; }
  .hm-rcb-done   { background:#eafaf1; color:#1e8449; }
  .hm-rcb-body   { font-size:12.5px; color:var(--text-muted); line-height:1.6; }
  .hm-rcb-body.locked { color:#aaa; font-style:italic; }

  /* ── AREAS MAIN ── */
  .hm-areas-main {
    background:var(--white); border-radius:14px; border:1px solid var(--border);
    padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.04);
    animation:hmFadeUp 0.5s 0.3s ease both;
  }
  .hm-badge-green {
    background:var(--gc-green-pale); color:var(--gc-green-dark);
    font-size:11px; font-weight:700; padding:3px 10px; border-radius:8px; white-space:nowrap;
  }

  /* Area filter tabs */
  .hm-area-tabs { display:flex; gap:6px; margin-bottom:14px; flex-wrap:wrap; }
  .hm-area-tab {
    padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600;
    color:var(--text-muted); background:var(--off-white); border:1.5px solid var(--border);
    cursor:pointer; transition:all 0.15s; user-select:none;
    display:inline-flex; align-items:center; gap:5px;
  }
  .hm-area-tab.active { background:var(--gc-green); color:var(--white); border-color:var(--gc-green); }
  .hm-area-tab:hover:not(.active) { border-color:var(--gc-green); color:var(--gc-green); }
  .hm-tab-dot { width:7px; height:7px; border-radius:50%; display:inline-block; }
  .hm-tab-dot.s { background:#27ae60; }
  .hm-tab-dot.d { background:var(--gc-gold); }
  .hm-tab-dot.e { background:#bbb; }

  /* Area cards grid */
  .hm-area-cards { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
  .hm-area-card {
    border-radius:12px; border:1.5px solid var(--border);
    padding:16px; transition:box-shadow 0.2s;
    display:flex; flex-direction:column; gap:8px;
  }
  .hm-area-card:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); }
  .hm-ac-submitted { border-color:#a9dfbf; background:#f8fffe; }
  .hm-ac-draft     { border-color:var(--gc-gold); background:var(--gc-gold-pale); }
  .hm-ac-empty     { border-color:var(--border); background:var(--off-white); }

  .hm-area-card-top { display:flex; align-items:center; justify-content:space-between; }
  .hm-area-num {
    font-size:10px; font-weight:700; letter-spacing:0.8px;
    text-transform:uppercase; color:var(--text-muted);
    background:var(--off-white); border:1px solid var(--border);
    padding:2px 8px; border-radius:6px;
  }
  .hm-area-status { font-size:10.5px; font-weight:700; padding:2px 9px; border-radius:8px; }
  .hm-as-submitted { background:#eafaf1; color:#1e8449; }
  .hm-as-draft     { background:var(--gc-gold-pale); color:#7d5a10; }
  .hm-as-empty     { background:#f0f0f0; color:#888; }

  .hm-area-name { font-size:13px; font-weight:600; color:var(--text-dark); line-height:1.3; }
  .hm-area-pts  { font-size:11px; color:var(--text-muted); }

  .hm-desc-toggle {
    display:flex; align-items:center; gap:5px;
    font-size:11.5px; color:var(--gc-green); font-weight:600;
    background:none; border:none; cursor:pointer; padding:0;
    font-family:'Source Sans 3',sans-serif;
  }
  .hm-area-desc { font-size:12px; color:var(--text-muted); line-height:1.6; display:none; margin-top:2px; }
  .hm-area-desc.open { display:block; }

  /* Template row */
  .hm-template-row {
    display:flex; align-items:center; justify-content:space-between;
    background:var(--gc-green-pale); border-radius:8px; padding:8px 12px; font-size:12px;
  }
  .hm-template-row-left { display:flex; align-items:center; gap:6px; color:var(--gc-green-dark); font-weight:500; }
  .hm-btn-dl {
    display:flex; align-items:center; gap:4px;
    font-size:11px; font-weight:700; color:var(--gc-green);
    background:none; border:1.5px solid var(--gc-green);
    border-radius:6px; padding:3px 9px; cursor:pointer;
    font-family:'Source Sans 3',sans-serif; transition:all 0.15s;
  }
  .hm-btn-dl:hover { background:var(--gc-green); color:var(--white); }

  /* File row */
  .hm-file-row {
    display:flex; align-items:center; gap:8px;
    background:#f4f7f5; border-radius:8px; padding:8px 12px; font-size:12px; color:var(--text-mid);
  }
  .hm-file-name { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }
  .hm-file-actions { display:flex; gap:4px; }
  .hm-fab {
    width:26px; height:26px; border-radius:6px;
    display:flex; align-items:center; justify-content:center;
    border:none; cursor:pointer; transition:all 0.15s;
  }
  .hm-fab-view { background:#e8f4fd; color:var(--blue); }
  .hm-fab-dl   { background:var(--gc-green-pale); color:var(--gc-green); }
  .hm-fab-del  { background:var(--danger-pale); color:var(--danger); }

  .hm-timestamp { font-size:11px; color:var(--text-muted); display:flex; align-items:center; gap:5px; }

  /* Submit row */
  .hm-submit-row { display:flex; gap:8px; margin-top:2px; }
  .hm-btn-replace {
    display:flex; align-items:center; gap:4px;
    padding:7px 12px; border-radius:8px; font-size:12px; font-weight:600;
    border:1.5px solid var(--border); background:var(--white);
    cursor:pointer; font-family:'Source Sans 3',sans-serif; color:var(--text-muted);
    transition:background 0.15s;
  }
  .hm-btn-replace:hover { background:var(--off-white); }
  .hm-btn-submit-area {
    flex:1; display:flex; align-items:center; justify-content:center; gap:5px;
    padding:7px 12px; border-radius:8px; font-size:12px; font-weight:600;
    border:none; cursor:pointer; font-family:'Source Sans 3',sans-serif;
    background:linear-gradient(135deg,var(--gc-green),var(--gc-green-light));
    color:var(--white); transition:opacity 0.15s;
  }
  .hm-btn-submit-area:hover:not(:disabled) { opacity:0.9; }
  .hm-btn-submit-area:disabled { background:linear-gradient(135deg,#27ae60,#2ecc71); cursor:default; }
  .hm-btn-attach {
    display:flex; align-items:center; gap:5px;
    padding:7px 12px; border-radius:8px; font-size:12px; font-weight:600;
    border:1.5px dashed var(--border); background:var(--white);
    cursor:pointer; font-family:'Source Sans 3',sans-serif; color:var(--text-muted);
    transition:all 0.15s; width:100%;
  }
  .hm-btn-attach:hover { border-color:var(--gc-green); color:var(--gc-green); }

  /* ── ACTIVITY LOG ── */
  .hm-activity-panel {
    background:var(--white); border-radius:14px; border:1px solid var(--border);
    padding:20px; margin-top:20px; box-shadow:0 2px 6px rgba(0,0,0,0.04);
    animation:hmFadeUp 0.5s 0.35s ease both;
  }
  .hm-activity-list { display:flex; flex-direction:column; }
  .hm-act-item {
    display:flex; align-items:flex-start; gap:14px;
    padding:12px 0; border-bottom:1px solid #f0f3f1;
  }
  .hm-act-item:last-child { border-bottom:none; }
  .hm-act-icon {
    width:34px; height:34px; border-radius:9px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
  }
  .hm-ai-gold  { background:var(--gc-gold-pale); color:#b7950b; }
  .hm-ai-green { background:#eafaf1; color:#1e8449; }
  .hm-ai-blue  { background:var(--blue-pale); color:var(--blue); }
  .hm-act-title { font-size:13px; font-weight:600; color:var(--text-dark); margin-bottom:3px; line-height:1.4; }
  .hm-act-meta  { font-size:11.5px; color:var(--text-muted); }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .hm-content-grid    { grid-template-columns: 1fr; }
    .hm-area-cards      { grid-template-columns: 1fr; }
    .hm-submit-bar      { flex-direction: column; align-items: stretch; gap: 12px; }
    .hm-prog-track      { width: 100%; margin: 0; }
    .hm-btn-submit-all  { justify-content: center; }
  }

  @media (max-width: 640px) {
    .hm-hero            { flex-direction: column; align-items: flex-start; padding: 20px; }
    .hm-hero-left       { gap: 14px; }
    .hm-avatar          { width: 48px; height: 48px; }
    .hm-name            { font-size: 17px; }
    .hm-hero-right      { align-self: stretch; display: flex; align-items: center; gap: 16px; }
    .hm-deadline-ring   { width: 72px; height: 72px; margin: 0; }
    .hm-deadline-ring svg { width: 72px; height: 72px; }
    .hm-ring-days       { font-size: 16px; }
    .hm-deadline-label  { font-size: 11px; }
    .hm-deadline-date   { font-size: 13px; }
    .hm-rank-flow       { gap: 5px; }
    .hm-rank-chip       { font-size: 11px; padding: 2px 8px; }
    .hm-panel-header    { flex-wrap: wrap; }
  }
    
  @media (max-width: 360px) {
    .hm-rank-flow { flex-direction: column; align-items: flex-start; }
    .hm-rank-chip { font-size: 10px; }
    .hm-area-tabs { gap: 4px; }
    .hm-area-tab  { font-size: 10.5px; padding: 3px 8px; }
  }
  @keyframes hmFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

// ── Static mock data — replace with Firebase when backend is ready ──

// TODO: fetch from Firestore — faculty's submitted area files for the current cycle
// collection: areasubmissions, filter by application_id of current faculty
const AREAS = [
    {
        num: "Area I",
        name: "Educational Qualifications",
        pts: "85.00",
        status: "submitted",
        file: "TOR_MastersDegree_Candido.pdf",
        date: "March 1, 2026 at 2:15 PM",
        desc: "Degrees earned, academic honors, and relevant certifications. Include TOR, diploma copies, and any graduate or post-graduate credentials.",
    },
    {
        num: "Area II",
        name: "Research & Publications",
        pts: "20.00",
        status: "submitted",
        file: "Research_Publications_2025.pdf",
        date: "Feb 25, 2026 at 10:00 AM",
        desc: "Published papers, journal articles, books, and research outputs. Include proof of publication such as journal pages, ISBN, or DOI references.",
    },
    {
        num: "Area III",
        name: "Teaching Experience",
        pts: "20.00",
        status: "submitted",
        file: "TeachingExperience_Records.pdf",
        date: "Feb 24, 2026 at 3:30 PM",
        desc: "Years of teaching service and related experience. Include service records, contracts, or certificates of employment.",
    },
    {
        num: "Area IV",
        name: "Performance Evaluation",
        pts: "10.00",
        status: "submitted",
        file: "PerformanceEval_AY2025.pdf",
        date: "Feb 23, 2026 at 9:00 AM",
        desc: "Faculty performance rating from student evaluations. This area is auto-scored from the CSV uploaded by HR.",
    },
    {
        num: "Area V",
        name: "Training & Seminars",
        pts: "10.00",
        status: "submitted",
        file: "Training_Seminars_2025.pdf",
        date: "Feb 22, 2026 at 11:15 AM",
        desc: "Relevant trainings, seminars, workshops attended. Include certificates of attendance or completion.",
    },
    {
        num: "Area VI",
        name: "Expert Services Rendered",
        pts: "20.00",
        status: "submitted",
        file: "ConsultancyServices_2025.pdf",
        date: "Feb 27, 2026 at 2:00 PM",
        desc: "Consultancy, technical assistance, and expert services rendered. Include contracts, MOAs, or certificates of recognition.",
    },
    {
        num: "Area VII",
        name: "Involvement in Professional Orgs",
        pts: "10.00",
        status: "submitted",
        file: "ProfOrg_Membership_2025.pdf",
        date: "Today at 6:30 PM",
        desc: "Membership, officership, or active participation in relevant professional bodies. Include membership ID or appointment proof.",
    },
    {
        num: "Area VIII",
        name: "Awards of Distinction",
        pts: "10.00",
        status: "draft",
        file: "Awards_Recognition_2025.pdf",
        date: null,
        desc: "Recognition, awards, and honors received in your field. Include award certificates, citations, or news clippings.",
    },
    {
        num: "Area IX",
        name: "Community Outreach",
        pts: "5.00",
        status: "empty",
        file: null,
        date: null,
        desc: "Extension programs, community service, and social involvement. Attach certificates of participation or barangay endorsements.",
    },
    {
        num: "Area X",
        name: "Professional Examinations",
        pts: "10.00",
        status: "empty",
        file: null,
        date: null,
        desc: "Licensure and civil service exam results (PRC, CSC, TESDA). Submit PRC ID, CSC eligibility certificate, or TESDA NC certificate.",
    },
];

// TODO: fetch from Firestore — area max points from the areas collection
const AREA_SCORES_PENDING = [
    { name: "Area I · Educational Qualifications", max: "85.00" },
    { name: "Area II · Research & Publications", max: "20.00" },
    { name: "Area III · Teaching Experience", max: "20.00" },
    { name: "Area IV · Performance Evaluation", max: "10.00" },
    { name: "Area V · Training & Seminars", max: "10.00" },
    { name: "Area VI · Expert Services Rendered", max: "20.00" },
    { name: "Area VII · Professional Organizations", max: "10.00" },
    { name: "Area VIII · Awards of Distinction", max: "10.00" },
    { name: "Area IX · Community Outreach", max: "5.00" },
    { name: "Area X · Professional Examinations", max: "10.00" },
];

// TODO: fetch from Firestore — areasubmissions scores once application status is "Published"
const AREA_SCORES_PUBLISHED = [
    { name: "Area I · Educational Qualifications", pts: 40, max: 85, pct: 47 },
    { name: "Area II · Research & Publications", pts: 12, max: 20, pct: 60 },
    { name: "Area III · Teaching Experience", pts: 15, max: 20, pct: 75 },
    { name: "Area IV · Performance Evaluation", pts: 8, max: 10, pct: 80 },
    { name: "Area V · Training & Seminars", pts: 4, max: 10, pct: 40 },
    { name: "Area VI · Expert Services Rendered", pts: 4, max: 20, pct: 20 },
    { name: "Area VII · Professional Organizations", pts: 1, max: 10, pct: 10 },
    { name: "Area VIII · Awards of Distinction", pts: 0, max: 10, pct: 0 },
    { name: "Area IX · Community Outreach", pts: 2, max: 5, pct: 40 },
    { name: "Area X · Professional Examinations", pts: 0, max: 10, pct: 0 },
];

// TODO: fetch from Firestore — applicationlogs collection, filter by current cycle's application_id
const ACTIVITY_LOG = [
    {
        icon: "gold",
        IconComp: Paperclip,
        text: "Area VIII (Awards of Distinction) file uploaded — awaiting submission",
        meta: "Today, 7:45 PM · Awards_Recognition_2025.pdf",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Area VII (Professional Organizations) submitted",
        meta: "Today, 6:30 PM · ProfOrg_Membership_2025.pdf",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Area VI (Expert Services) submitted",
        meta: "Feb 27, 2026 · ConsultancyServices_2025.pdf",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Areas I–V successfully submitted",
        meta: "Feb 20–25, 2026 · All documents verified",
    },
    {
        icon: "blue",
        IconComp: Megaphone,
        text: "Ranking cycle opened — 1st Semester AY 2026–2027",
        meta: "Feb 1, 2026 · Deadline: March 15, 2026 · HR Department",
    },
];

function AreaCard({ area }) {
    const [descOpen, setDescOpen] = useState(false);

    const cardClass =
        area.status === "submitted"
            ? "hm-area-card hm-ac-submitted"
            : area.status === "draft"
              ? "hm-area-card hm-ac-draft"
              : "hm-area-card hm-ac-empty";
    const statusClass =
        area.status === "submitted"
            ? "hm-area-status hm-as-submitted"
            : area.status === "draft"
              ? "hm-area-status hm-as-draft"
              : "hm-area-status hm-as-empty";
    const statusLabel =
        area.status === "submitted"
            ? "Submitted"
            : area.status === "draft"
              ? "Draft"
              : "Pending";

    return (
        <div className={cardClass}>
            <div className="hm-area-card-top">
                <span className="hm-area-num">{area.num}</span>
                <span className={statusClass}>{statusLabel}</span>
            </div>

            <div className="hm-area-name">{area.name}</div>

            <button
                className="hm-desc-toggle"
                onClick={() => setDescOpen((v) => !v)}
            >
                {descOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                What to submit
            </button>
            {descOpen && <div className="hm-area-desc open">{area.desc}</div>}

            <div className="hm-area-pts">
                Max: <strong>{area.pts} pts</strong> · Excess points applicable
            </div>

            {/* TODO: connect to Firebase Storage — fetch real template file URL per area */}
            <div className="hm-template-row">
                <div className="hm-template-row-left">
                    <FileText size={13} />
                    {area.num} Template
                </div>
                <button className="hm-btn-dl">
                    <Download size={11} /> Download
                </button>
            </div>

            {area.file && (
                <div className="hm-file-row">
                    <FileText size={13} />
                    <span className="hm-file-name">{area.file}</span>
                    <div className="hm-file-actions">
                        <button className="hm-fab hm-fab-view">
                            <Eye size={12} />
                        </button>
                        <button className="hm-fab hm-fab-dl">
                            <Download size={12} />
                        </button>
                        {area.status === "draft" && (
                            <button className="hm-fab hm-fab-del">
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {area.date && (
                <div className="hm-timestamp">
                    <Calendar size={11} />
                    Submitted on {area.date}
                </div>
            )}

            {area.status === "submitted" && (
                // TODO: replace file — upload new file to Firebase Storage, update areasubmissions doc
                <div className="hm-submit-row">
                    <button className="hm-btn-replace">
                        <RefreshCw size={12} /> Replace File
                    </button>
                    <button className="hm-btn-submit-area" disabled>
                        <CheckCircle size={12} /> Submitted
                    </button>
                </div>
            )}

            {area.status === "draft" && (
                // TODO: submit area — update areasubmissions doc status to "submitted" in Firestore
                <div className="hm-submit-row">
                    <button className="hm-btn-submit-area">
                        <Send size={12} /> Submit Area
                    </button>
                </div>
            )}

            {area.status === "empty" && (
                // TODO: attach file — upload to Firebase Storage, create areasubmissions doc with status "draft"
                <>
                    <button className="hm-btn-attach">
                        <Paperclip size={13} /> Attach supporting document
                    </button>
                    <div className="hm-submit-row" style={{ marginTop: 4 }}>
                        <button
                            className="hm-btn-submit-area"
                            disabled
                            style={{ opacity: 0.45, cursor: "not-allowed" }}
                        >
                            <Send size={12} /> Submit Area
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default function Home({ user }) {
    const [scoreView, setScoreView] = useState("pending");
    const [areaFilter, setAreaFilter] = useState("all");

    const filteredAreas = AREAS.filter((a) =>
        areaFilter === "all"
            ? true
            : areaFilter === "submitted"
              ? a.status === "submitted"
              : areaFilter === "draft"
                ? a.status === "draft"
                : areaFilter === "empty"
                  ? a.status === "empty"
                  : true,
    );

    return (
        <>
            <style>{styles}</style>

            {/* ── HERO CARD ── */}
            {/* TODO: replace hardcoded cycle, rank, status, department, deadline with Firestore data
          - cycle info    : rankingcycles collection (current open cycle)
          - rank + dept   : users collection (current faculty doc)
          - app status    : applications collection (current cycle application)
          - deadline      : rankingcycles.deadline field */}
            <div className="hm-hero">
                <div className="hm-hero-left">
                    <div className="hm-hero-info">
                        <div className="hm-cycle-tag">
                            1st Semester AY 2026–2027 · Open Cycle
                        </div>
                        <div className="hm-name">
                            {user?.displayName || "Faculty Member"}
                        </div>
                        <div className="hm-rank-flow">
                            <span className="hm-rank-chip">
                                <School size={11} /> Instructor I
                            </span>
                            <span className="hm-rank-arrow">
                                <ArrowRight size={13} />
                            </span>
                            <span className="hm-rank-chip target">
                                <Star size={11} /> Instructor II
                            </span>
                            <span className="hm-status-pill hm-status-draft">
                                ● Draft
                            </span>
                        </div>
                        <div className="hm-dept-tag">
                            <Building2 size={12} /> Department of Computer
                            Studies
                        </div>
                    </div>
                </div>
                <div className="hm-hero-right">
                    {/* TODO: calculate daysLeft and totalDays from rankingcycles.deadline
                        and rankingcycles.start_date fetched from Firestore.
                        dashOffset = circumference * (1 - daysLeft / totalDays) 
                    */}
                    <div className="hm-deadline-ring">
                        <svg viewBox="0 0 96 96">
                            <circle
                                className="hm-ring-bg"
                                cx="48"
                                cy="48"
                                r="40"
                            />
                            <circle
                                className="hm-ring-fill"
                                cx="48"
                                cy="48"
                                r="40"
                            />
                        </svg>
                        <div className="hm-ring-center">
                            <span className="hm-ring-days">15</span>
                            <span className="hm-ring-days-label">
                                Days Left
                            </span>
                        </div>
                    </div>
                    <div className="hm-deadline-label">Submission Deadline</div>
                    <div className="hm-deadline-date">March 15, 2026</div>
                </div>
            </div>

            {/* ── SUBMIT ALL BAR ── */}
            {/* TODO: submit application — update applications doc status to "Submitted" in Firestore
          disable button until all 10 areas are submitted */}
            <div className="hm-submit-bar">
                <div className="hm-submit-info">
                    <h4>Ready to submit your application?</h4>
                    <p>
                        Complete all 10 areas then submit for HR &amp; VPAA
                        review.
                    </p>
                </div>
                <div className="hm-prog-track">
                    {/* TODO: calculate dynamically — count submitted areas from areasubmissions / total 10 */}
                    <div className="hm-prog-label">
                        <span>Overall progress</span>
                        <span>7 / 10 areas</span>
                    </div>
                    <div className="hm-prog-bar">
                        <div className="hm-prog-fill" />
                    </div>
                </div>
                <button className="hm-btn-submit-all">
                    <Upload size={14} /> Submit Application
                </button>
            </div>

            {/* ── CONTENT GRID ── */}
            <div className="hm-content-grid">
                {/* Score Sidebar */}
                <div className="hm-score-sidebar">
                    <div className="hm-panel-header">
                        <div>
                            <div className="hm-panel-title">
                                Score Breakdown
                            </div>
                            <div className="hm-panel-sub">
                                200-point ranking system
                            </div>
                        </div>
                        {/* TODO: REMOVE IN PRODUCTION — dev-only toggle to preview published score state
                In production, scoreView is driven by application.status from Firestore:
                "Published" → show published state, anything else → pending/locked state */}
                        <button
                            className="hm-preview-btn"
                            onClick={() =>
                                setScoreView((v) =>
                                    v === "pending" ? "published" : "pending",
                                )
                            }
                        >
                            <Eye size={11} />
                            {scoreView === "pending"
                                ? "Preview Published"
                                : "Back to Pending"}
                        </button>
                    </div>

                    {scoreView === "pending" ? (
                        <>
                            <div className="hm-score-locked">
                                <Lock
                                    size={16}
                                    color="var(--gc-green)"
                                    style={{ flexShrink: 0, marginTop: 2 }}
                                />
                                <p>
                                    Scores are visible only after{" "}
                                    <strong>HR scoring</strong> is verified and
                                    approved by the <strong>VPAA</strong>.
                                </p>
                            </div>
                            <div
                                className="hm-total-box"
                                style={{
                                    opacity: 0.4,
                                    filter: "blur(2px)",
                                    userSelect: "none",
                                }}
                            >
                                <div className="hm-ts-label">Final Score</div>
                                <div className="hm-ts-value">— / 200</div>
                                <div className="hm-ts-max">Pending review</div>
                            </div>
                            <div className="hm-area-scores">
                                {AREA_SCORES_PENDING.map((a, i) => (
                                    <div key={i}>
                                        <div className="hm-asr-top">
                                            <span className="hm-asr-name">
                                                {a.name}
                                            </span>
                                            <span className="hm-asr-hidden">
                                                <Lock size={10} /> Hidden
                                            </span>
                                        </div>
                                        <div className="hm-asr-track">
                                            <div
                                                className="hm-asr-fill"
                                                style={{ width: "0%" }}
                                            />
                                        </div>
                                        <div className="hm-asr-max">
                                            Max: {a.max} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hm-rcb">
                                <div className="hm-rcb-header">
                                    <div className="hm-rcb-avatar hm-rcb-hr">
                                        HR
                                    </div>
                                    <div>
                                        <div className="hm-rcb-name">
                                            HR Department
                                        </div>
                                        <div className="hm-rcb-label">
                                            Scoring Comment
                                        </div>
                                    </div>
                                    <span className="hm-rcb-status hm-rcb-locked">
                                        Locked
                                    </span>
                                </div>
                                <div className="hm-rcb-body locked">
                                    Visible only after VPAA fully approves the
                                    application.
                                </div>
                            </div>
                            <div className="hm-rcb">
                                <div className="hm-rcb-header">
                                    <div className="hm-rcb-avatar hm-rcb-vpaa">
                                        VP
                                    </div>
                                    <div>
                                        <div className="hm-rcb-name">
                                            VPAA Office
                                        </div>
                                        <div className="hm-rcb-label">
                                            Verification Comment
                                        </div>
                                    </div>
                                    <span className="hm-rcb-status hm-rcb-locked">
                                        Locked
                                    </span>
                                </div>
                                <div className="hm-rcb-body locked">
                                    Visible only after VPAA fully approves the
                                    application.
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    background: "#eafaf1",
                                    border: "1.5px solid #a9dfbf",
                                    borderRadius: 10,
                                    padding: "12px 14px",
                                    marginBottom: 12,
                                }}
                            >
                                <Trophy size={20} color="#1e8449" />
                                <div>
                                    <div
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#1e8449",
                                            marginBottom: 2,
                                        }}
                                    >
                                        Score Published
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 11,
                                            color: "#2e7d52",
                                        }}
                                    >
                                        Approved by VPAA · Mar 20, 2026
                                    </div>
                                </div>
                            </div>
                            <div className="hm-total-box">
                                <div className="hm-ts-label">Final Score</div>
                                <div className="hm-ts-value">86 / 200</div>
                                <div className="hm-ts-max">
                                    Instructor II threshold: 120 pts
                                </div>
                            </div>
                            <div className="hm-area-scores">
                                {AREA_SCORES_PUBLISHED.map((a, i) => (
                                    <div key={i}>
                                        <div className="hm-asr-top">
                                            <span className="hm-asr-name">
                                                {a.name}
                                            </span>
                                            <span className="hm-asr-pts">
                                                {a.pts}.00
                                            </span>
                                        </div>
                                        <div className="hm-asr-track">
                                            <div
                                                className="hm-asr-fill"
                                                style={{ width: `${a.pct}%` }}
                                            />
                                        </div>
                                        <div className="hm-asr-max">
                                            Max: {a.max}.00 pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="hm-rcb">
                                <div className="hm-rcb-header">
                                    <div className="hm-rcb-avatar hm-rcb-hr">
                                        HR
                                    </div>
                                    <div>
                                        <div className="hm-rcb-name">
                                            HR Department
                                        </div>
                                        <div className="hm-rcb-label">
                                            Scoring Comment · Mar 18, 2026
                                        </div>
                                    </div>
                                    <span className="hm-rcb-status hm-rcb-done">
                                        ✓ Done
                                    </span>
                                </div>
                                <div className="hm-rcb-body">
                                    Documents verified. Area I score reflects
                                    highest earned degree (Masters). Areas VIII
                                    and X have no supporting documents — scored
                                    0.
                                </div>
                            </div>
                            <div className="hm-rcb">
                                <div className="hm-rcb-header">
                                    <div className="hm-rcb-avatar hm-rcb-vpaa">
                                        VP
                                    </div>
                                    <div>
                                        <div className="hm-rcb-name">
                                            VPAA Office
                                        </div>
                                        <div className="hm-rcb-label">
                                            Verification Comment · Mar 20, 2026
                                        </div>
                                    </div>
                                    <span className="hm-rcb-status hm-rcb-done">
                                        ✓ Approved
                                    </span>
                                </div>
                                <div className="hm-rcb-body">
                                    Score verified and approved. Total of 86/200
                                    does not meet the 120-point threshold for
                                    Instructor II promotion. Current rank
                                    retained.
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Areas Main */}
                <div className="hm-areas-main">
                    <div
                        className="hm-panel-header"
                        style={{ marginBottom: 14 }}
                    >
                        <div>
                            <div className="hm-panel-title">
                                Career Advancement Areas
                            </div>
                            <div className="hm-panel-sub">
                                Download template → fill → upload · Submit each
                                area individually
                            </div>
                        </div>
                        <span className="hm-badge-green">10 Areas</span>
                    </div>

                    <div className="hm-area-tabs">
                        {[
                            { key: "all", label: "All (10)" },
                            {
                                key: "submitted",
                                label: "Submitted (7)",
                                dot: "s",
                            },
                            { key: "draft", label: "Draft (1)", dot: "d" },
                            { key: "empty", label: "Pending (2)", dot: "e" },
                        ].map((t) => (
                            <button
                                key={t.key}
                                className={`hm-area-tab${areaFilter === t.key ? " active" : ""}`}
                                onClick={() => setAreaFilter(t.key)}
                            >
                                {t.dot && (
                                    <span className={`hm-tab-dot ${t.dot}`} />
                                )}
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <div className="hm-area-cards">
                        {filteredAreas.map((area, i) => (
                            <AreaCard key={i} area={area} />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── ACTIVITY LOG ── */}
            <div className="hm-activity-panel">
                <div className="hm-panel-header" style={{ marginBottom: 14 }}>
                    <div>
                        <div className="hm-panel-title">Application Log</div>
                        <div className="hm-panel-sub">
                            Last 20 submission and review activity for this
                            cycle
                        </div>
                    </div>
                    <span className="hm-badge-green">Current Cycle</span>
                </div>
                <div className="hm-activity-list">
                    {ACTIVITY_LOG.map((a, i) => (
                        <div className="hm-act-item" key={i}>
                            <div className={`hm-act-icon hm-ai-${a.icon}`}>
                                <a.IconComp size={15} />
                            </div>
                            <div>
                                <div className="hm-act-title">{a.text}</div>
                                <div className="hm-act-meta">{a.meta}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
