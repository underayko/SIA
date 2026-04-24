// 📄 SIA/frontend/src/pages/faculty/tabs/History.jsx

import { useState } from "react";

// ─── Styles ──────────────────────────────────────────────────
const css = `
  @keyframes histFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .hist-panel {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #dde5df;
    padding: 24px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.04);
    margin-bottom: 20px;
    animation: histFadeUp 0.45s ease both;
  }
  .hist-panel:last-child { margin-bottom: 0; }
  .hist-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 16px;
  }
  @media (max-width: 900px) { .hist-grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 600px) { .hist-grid { grid-template-columns: 1fr; } }

  .hc {
    border: 1.5px solid #dde5df;
    border-radius: 12px;
    padding: 18px;
    background: #f8f7f4;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
  }
  .hc:hover { border-color: #1a6b3c; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }
  .hc.open  { border-color: #1a6b3c; background: #eef7f2; }

  .hc-tag {
    font-size: 9.5px; font-weight: 700; letter-spacing: 1.2px;
    text-transform: uppercase; color: #6b7c70; margin-bottom: 8px;
  }
  .hc.open .hc-tag { color: #1a6b3c; }

  .hc-title {
    font-family: 'Playfair Display', serif;
    font-size: 14px; font-weight: 600;
    color: #1a1a1a; margin-bottom: 6px; line-height: 1.3;
  }
  .hc-meta { font-size: 11.5px; color: #6b7c70; margin-bottom: 10px; line-height: 1.5; }

  .hc-row { display: flex; align-items: center; justify-content: space-between; }

  .hc-badge {
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 10px;
  }
  .hcb-published { background: #eafaf1; color: #1e8449; }
  .hcb-open      { background: #1a6b3c; color: #fff; }
  .hcb-draft     { background: #fdf8ec; color: #7d5a10; }
  .hcb-closed    { background: #f5f5f5; color: #888; }

  .hc-score {
    font-size: 14px; font-weight: 700;
    color: #134f2c; font-family: 'Playfair Display', serif;
  }
  .hc-score.pending {
    font-size: 11px; color: #6b7c70;
    font-family: 'Source Sans 3', sans-serif; font-style: italic; font-weight: 400;
  }

  .hc-rank {
    display: flex; align-items: center; gap: 5px;
    margin-top: 8px; font-size: 11px; color: #6b7c70;
  }
  .hc-rank .arrow { color: #1a6b3c; font-weight: 700; }
  .hc-rank .retained { color: #c0392b; }

  .open-pill {
    position: absolute; top: 14px; right: 14px;
    background: #1a6b3c; color: #fff;
    font-size: 9px; font-weight: 700; letter-spacing: 0.8px;
    padding: 2px 8px; border-radius: 8px; text-transform: uppercase;
  }

  /* Log table */
  .log-wrap { overflow-x: auto; margin-top: 14px; }
  .log-tbl {
    width: 100%; border-collapse: collapse;
    font-family: 'Source Sans 3', sans-serif;
  }
  .log-tbl th {
    font-size: 10.5px; font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.8px; color: #6b7c70; text-align: left;
    padding: 8px 12px; border-bottom: 2px solid #dde5df;
    background: #f8f7f4; white-space: nowrap;
  }
  .log-tbl th:first-child { border-radius: 8px 0 0 0; }
  .log-tbl th:last-child  { border-radius: 0 8px 0 0; }
  .log-tbl td {
    font-size: 12.5px; color: #3a4a3e;
    padding: 10px 12px; border-bottom: 1px solid #f0f3f1;
    white-space: nowrap;
  }
  .log-tbl tr:last-child td { border-bottom: none; }
  .log-tbl tr:hover td { background: #eef7f2; }

  .la {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 2px 9px; border-radius: 8px; font-size: 11px; font-weight: 600;
    white-space: nowrap;
  }
  .la-submit  { background: #eafaf1; color: #1e8449; }
  .la-draft   { background: #fdf8ec; color: #7d5a10; }
  .la-review  { background: #eaf3fb; color: #2471a3; }
  .la-publish { background: #eef7f2; color: #1a6b3c; }
  .la-upload  { background: #f0eafa; color: #6c3483; }
  .la-replace { background: #eaf4fb; color: #1a5276; }
`;

// ─── Mock data ────────────────────────────────────────────────
const MOCK_CYCLES = [
    {
        id: 1,
        tag: "Current Cycle",
        title: "1st Semester AY 2026–2027",
        meta: ["Started: Feb 1, 2026", "Deadline: March 15, 2026"],
        status: "open",
        statusLabel: "In Progress",
        score: null,
        rankFrom: "Instructor I",
        rankTo: "Instructor II (target)",
        retained: false,
        isOpen: true,
    },
    {
        id: 2,
        tag: "Completed",
        title: "2nd Semester AY 2025–2026",
        meta: ["Started: Aug 1, 2025", "Published: Oct 10, 2025"],
        status: "published",
        statusLabel: "Published",
        score: "86 / 200",
        rankFrom: "Instructor I",
        rankTo: "Retained (not qualified)",
        retained: true,
        isOpen: false,
    },
    {
        id: 3,
        tag: "Completed",
        title: "1st Semester AY 2025–2026",
        meta: ["Started: Feb 1, 2025", "Published: Apr 5, 2025"],
        status: "published",
        statusLabel: "Published",
        score: "74 / 200",
        rankFrom: "Instructor I",
        rankTo: "Retained (not qualified)",
        retained: true,
        isOpen: false,
    },
];

const MOCK_LOGS = [
    { id: 1, datetime: "Feb 28, 2026 · 7:45 PM", cycle: "1st Sem AY 2026–27", action: "File Uploaded",  actionClass: "la-upload",  area: "Area VIII — Awards of Distinction (pending submission)",              by: "D. Candido" },
    { id: 2, datetime: "Feb 28, 2026 · 5:02 PM", cycle: "1st Sem AY 2026–27", action: "File Replaced",  actionClass: "la-replace", area: "Area VII — Professional Organizations (updated before deadline)",    by: "D. Candido" },
    { id: 3, datetime: "Feb 28, 2026 · 6:30 PM", cycle: "1st Sem AY 2026–27", action: "Submitted",      actionClass: "la-submit",  area: "Area VII — Professional Organizations",                             by: "D. Candido" },
    { id: 4, datetime: "Feb 27, 2026 · 3:10 PM", cycle: "1st Sem AY 2026–27", action: "Submitted",      actionClass: "la-submit",  area: "Area VI — Expert Services",                                        by: "D. Candido" },
    { id: 5, datetime: "Feb 25, 2026 · 11:20 AM",cycle: "1st Sem AY 2026–27", action: "Submitted",      actionClass: "la-submit",  area: "Areas I–V (batch submission)",                                     by: "D. Candido" },
    { id: 6, datetime: "Oct 10, 2025 · 2:00 PM", cycle: "2nd Sem AY 2025–26", action: "Published",      actionClass: "la-publish", area: "Final Score: 86/200 · Rank retained (did not meet 120pt threshold)",by: "VPAA Office" },
    { id: 7, datetime: "Sep 28, 2025 · 10:15 AM",cycle: "2nd Sem AY 2025–26", action: "VPAA Review",    actionClass: "la-review",  area: "Score certified · VPAA comment added",                             by: "Dr. M. Reyes (VPAA)" },
    { id: 8, datetime: "Sep 12, 2025 · 9:00 AM", cycle: "2nd Sem AY 2025–26", action: "HR Scored",      actionClass: "la-review",  area: "All areas scored · Total: 86/200 · HR comment added",              by: "HR Department" },
    { id: 9, datetime: "Aug 20, 2025 · 4:30 PM", cycle: "2nd Sem AY 2025–26", action: "Submitted",      actionClass: "la-submit",  area: "Full application submitted",                                       by: "D. Candido" },
    { id:10, datetime: "Apr 5, 2025 · 2:00 PM",  cycle: "1st Sem AY 2025–26", action: "Published",      actionClass: "la-publish", area: "Final Score: 74/200 · Rank retained (did not meet 120pt threshold)",by: "VPAA Office" },
];

const ACTION_ICONS = {
    "File Uploaded": "📎",
    "File Replaced": "🔄",
    "Submitted":     "📤",
    "Published":     "🏆",
    "VPAA Review":   "🔍",
    "VPAA Approved": "✅",
    "HR Scored":     "📋",
    "Draft Saved":   "📝",
};

// ─── Sub-components ───────────────────────────────────────────
function CycleCard({ cycle }) {
    const badgeClass = {
        open:      "hcb-open",
        published: "hcb-published",
        draft:     "hcb-draft",
        closed:    "hcb-closed",
    }[cycle.status] || "hcb-closed";

    return (
        <div className={`hc${cycle.isOpen ? " open" : ""}`}>
            {cycle.isOpen && <span className="open-pill">Open</span>}
            <div className="hc-tag">{cycle.tag}</div>
            <div className="hc-title">{cycle.title}</div>
            <div className="hc-meta">
                {cycle.meta.map((m, i) => <span key={i}>{m}<br /></span>)}
            </div>
            <div className="hc-row">
                <span className={`hc-badge ${badgeClass}`}>{cycle.statusLabel}</span>
                {cycle.score
                    ? <span className="hc-score">{cycle.score}</span>
                    : <span className="hc-score pending">Score pending</span>
                }
            </div>
            <div className="hc-rank">
                <span>{cycle.rankFrom}</span>
                <span className="arrow">{cycle.retained ? "✓" : "→"}</span>
                <span className={cycle.retained ? "retained" : ""}>{cycle.rankTo}</span>
            </div>
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────
export default function History({ cycles, logs }) {
    const cycleData = cycles || MOCK_CYCLES;
    const logData   = logs   || MOCK_LOGS;

    const [showAll, setShowAll] = useState(false);
    const visibleCycles = showAll ? cycleData : cycleData.slice(0, 3);

    return (
        <>
            {/* Inject styles once */}
            <style>{css}</style>

            {/* ── Ranking Cycle History ── */}
            <div className="hist-panel">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
                            Ranking Cycle History
                        </div>
                        <div style={{ fontSize: 12.5, color: "#6b7c70", marginTop: 3 }}>
                            All cycles you have participated in or that are currently open
                        </div>
                    </div>
                    <span style={{ background: "#eef7f2", color: "#1a6b3c", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {cycleData.length} Cycle{cycleData.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="hist-grid">
                    {visibleCycles.map(c => <CycleCard key={c.id} cycle={c} />)}
                </div>

                {cycleData.length > 3 && (
                    <div style={{ marginTop: 14, textAlign: "right" }}>
                        <button
                            onClick={() => setShowAll(p => !p)}
                            style={{ background: "none", border: "none", color: "#1a6b3c", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                            {showAll ? "Show less ←" : `See more →`}
                        </button>
                    </div>
                )}
            </div>

            {/* ── Submission & Review Log ── */}
            <div className="hist-panel">
                <div style={{ marginBottom: 4 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
                        Submission &amp; Review Log
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6b7c70", marginTop: 3 }}>
                        Full activity trail across all ranking cycles
                    </div>
                </div>

                <div className="log-wrap">
                    <table className="log-tbl">
                        <thead>
                            <tr>
                                <th>Date &amp; Time</th>
                                <th>Cycle</th>
                                <th>Action</th>
                                <th>Area / Description</th>
                                <th>Changed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logData.map(row => (
                                <tr key={row.id}>
                                    <td style={{ color: "#6b7c70", fontSize: 12 }}>{row.datetime}</td>
                                    <td style={{ fontSize: 12 }}>{row.cycle}</td>
                                    <td>
                                        <span className={`la ${row.actionClass}`}>
                                            {ACTION_ICONS[row.action] || "•"} {row.action}
                                        </span>
                                    </td>
                                    <td style={{ maxWidth: 320, whiteSpace: "normal" }}>{row.area}</td>
                                    <td style={{ color: "#6b7c70" }}>{row.by}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
