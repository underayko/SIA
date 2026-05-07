// SIA/frontend/src/pages/faculty/tabs/History.jsx

import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

// â”€â”€â”€ Styles â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// Intentionally no mock rows here so History only shows live data.


const CYCLE_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_CYCLE_TABLE_CANDIDATES ||
    "ranking_cycles,rankingcycles,cycles"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const APPLICATION_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_APPLICATION_TABLE_CANDIDATES ||
    "applications,ranking_applications,faculty_applications"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const APPLICATION_LOG_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_APPLICATION_LOG_TABLE_CANDIDATES ||
    ""  // Skip application_logs queries - table schema incompatible
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const USER_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_USER_TABLE_CANDIDATES ||
    "users,profiles,faculty_profiles"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

function getFirstValue(source, keys, fallback = null) {
    if (!source) return fallback;
    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return fallback;
}

function isColumnOrTableError(error) {
    const message = String(error?.message || "").toLowerCase();
    return (
        message.includes("does not exist") ||
        message.includes("column") ||
        message.includes("relation")
    );
}

function toTitleCase(value) {
    const text = String(value || "").trim();
    if (!text) return "Updated";
    return text
        .replace(/[_-]/g, " ")
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
}

function formatDateTime(value) {
    if (!value) return "Unknown date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatShortDate(value, fallback = "Unknown") {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("en-PH", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function parseTimestamp(row) {
    const raw = getFirstValue(row, [
        "changed_at",
        "updated_at",
        "created_at",
        "timestamp",
        "published_at",
        "submitted_at",
    ]);
    if (!raw) return 0;
    const time = new Date(raw).getTime();
    return Number.isFinite(time) ? time : 0;
}

async function queryRowsFromTableCandidates(tableCandidates, limit = 80) {
    for (const table of tableCandidates) {
        const ordered = await supabase
            .from(table)
            .select("*")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (!ordered.error && Array.isArray(ordered.data)) {
            return { table, rows: ordered.data };
        }

        const plain = await supabase.from(table).select("*").limit(limit);
        if (!plain.error && Array.isArray(plain.data)) {
            return { table, rows: plain.data };
        }
    }

    return { table: null, rows: [] };
}

function buildUserFilterCandidates(user) {
    return [
        ["user_id", user?.user_id],
        ["faculty_id", user?.user_id],
        ["uid", user?.user_id],
        ["email", user?.email],
        ["user_email", user?.email],
        ["domain_email", user?.email],
    ].filter(([, value]) => Boolean(value));
}

async function queryRowsByUser(tableCandidates, user, limit = 120) {
    const candidates = buildUserFilterCandidates(user);
    if (candidates.length === 0) {
        return { table: null, rows: [] };
    }

    for (const table of tableCandidates) {
        for (const [column, value] of candidates) {
            const result = await supabase
                .from(table)
                .select("*")
                .eq(column, value)
                .limit(limit);

            if (!result.error && Array.isArray(result.data)) {
                return { table, rows: result.data };
            }

            // If column doesn't exist, continue to next candidate
            if (isColumnOrTableError(result.error)) {
                continue;
            }
        }
    }

    return { table: null, rows: [] };
}

async function querySingleByUser(tableCandidates, user) {
    const candidates = buildUserFilterCandidates(user);
    if (candidates.length === 0) {
        return { table: null, row: null };
    }

    for (const table of tableCandidates) {
        for (const [column, value] of candidates) {
            const result = await supabase
                .from(table)
                .select("*")
                .eq(column, value)
                .maybeSingle();

            if (!result.error) {
                return { table, row: result.data || null };
            }

            if (!isColumnOrTableError(result.error)) {
                continue;
            }
        }
    }

    return { table: null, row: null };
}

function mapStatusToCard(statusText, isOpen) {
    const status = String(statusText || "").toLowerCase();
    if (isOpen || status.includes("open")) {
        return { status: "open", statusLabel: "In Progress", isOpen: true };
    }
    if (
        status.includes("publish") ||
        status.includes("complete") ||
        status.includes("closed")
    ) {
        return { status: "published", statusLabel: "Published", isOpen: false };
    }
    if (status.includes("draft") || status.includes("pending")) {
        return { status: "draft", statusLabel: "Draft", isOpen: false };
    }
    return { status: "closed", statusLabel: "Closed", isOpen: false };
}

function toPeriodCards(periodRows) {
    if (!Array.isArray(periodRows) || periodRows.length === 0) {
        return [];
    }

    return periodRows.map((period, index) => {
        const periodId = getFirstValue(period, ["cycle_id", "id"]);
        const title = String(
            getFirstValue(period, ["title", "cycle", "cycle_name", "name"], `Period ${index + 1}`),
        );
        const startDate = getFirstValue(period, ["start_date", "start_at", "created_at"]);
        const deadlineDate = getFirstValue(period, ["deadline", "deadline_at", "submission_deadline"]);
        const publishedAt = getFirstValue(period, ["published_at", "closed_at", "updated_at"]);
        const statusBits = mapStatusToCard(
            getFirstValue(period, ["status", "state"], ""),
            Boolean(getFirstValue(period, ["is_open", "submission_open", "open"], false)),
        );

        return {
            id: periodId || `period-${index}`,
            tag: statusBits.isOpen ? "Current Period" : "Completed",
            title,
            meta: [
                `Started: ${formatShortDate(startDate, "Unknown")}`,
                statusBits.isOpen
                    ? `Deadline: ${formatShortDate(deadlineDate, "TBA")}`
                    : `Published: ${formatShortDate(publishedAt || deadlineDate, "TBA")}`,
            ],
            status: statusBits.status,
            statusLabel: statusBits.statusLabel,
            isOpen: statusBits.isOpen,
        };
    });
}

function mapActionClass(actionText) {
    const action = String(actionText || "").toLowerCase();
    if (action.includes("publish") || action.includes("approve")) return "la-publish";
    if (action.includes("review") || action.includes("score")) return "la-review";
    if (action.includes("upload")) return "la-upload";
    if (action.includes("replace") || action.includes("update")) return "la-replace";
    if (action.includes("draft") || action.includes("save")) return "la-draft";
    return "la-submit";
}

function mapActionLabel(actionText) {
    const raw = String(actionText || "").trim();
    if (!raw) return "Submitted";
    return toTitleCase(raw);
}

function toLogRows(logRows, cycleRows, fallbackBy) {
    if (!Array.isArray(logRows) || logRows.length === 0) {
        return [];
    }

    const cycleMap = new Map(
        (periodRows || []).map((period) => [
            String(getFirstValue(period, ["cycle_id", "id"], "")),
            String(getFirstValue(period, ["title", "cycle", "cycle_name", "name"], "Unknown period")),
        ]),
    );

    return [...logRows]
        .sort((a, b) => parseTimestamp(b) - parseTimestamp(a))
        .slice(0, 100)
        .map((row, index) => {
            const action = mapActionLabel(
                getFirstValue(row, ["action", "new_status", "status", "event"], "Submitted"),
            );
            const cycleId = getFirstValue(row, ["cycle_id", "ranking_cycle_id", "cycleId"]);
            const cycleLabel = cycleId
                ? cycleMap.get(String(cycleId))
                : getFirstValue(row, ["cycle_label", "cycle_name"], "Unknown period");

            const areaId = getFirstValue(row, ["area_id"], null);
            const partId = getFirstValue(row, ["part_id", "subpart_id"], null);
            const detail = getFirstValue(row, ["comment", "description", "details", "file_name"], null);
            const areaDescription = detail
                ? String(detail)
                : areaId && partId
                    ? `Area ${areaId} - ${partId}`
                    : areaId
                        ? `Area ${areaId}`
                        : "Application update";

            return {
                id: getFirstValue(row, ["log_id", "id"], `log-${index}`),
                datetime: formatDateTime(
                    getFirstValue(row, ["changed_at", "created_at", "updated_at", "timestamp"], null),
                ),
                cycle: String(cycleLabel || "Unknown period"),
                action,
                actionClass: mapActionClass(action),
                area: areaDescription,
                by: String(
                    getFirstValue(row, ["changed_by_name", "changed_by", "updated_by", "actor"], fallbackBy || "System"),
                ),
            };
        });
}

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PeriodCard({ period }) {
    const badgeClass = {
        open:      "hcb-open",
        published: "hcb-published",
        draft:     "hcb-draft",
        closed:    "hcb-closed",
    }[period.status] || "hcb-closed";

    return (
        <div className={`hc${period.isOpen ? " open" : ""}`}>
            {period.isOpen && <span className="open-pill">Open</span>}
            <div className="hc-tag">{period.tag}</div>
            <div className="hc-title">{period.title}</div>
            <div className="hc-meta">
                {period.meta.map((m, i) => <span key={i}>{m}<br /></span>)}
            </div>
            <div className="hc-row">
                <span className={`hc-badge ${badgeClass}`}>{period.statusLabel}</span>
            </div>
        </div>
    );
}

// â”€â”€â”€ Main Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function History({ user, cycles, logs }) {
    const [periodData, setPeriodData] = useState(cycles || []);
    const [isLoading, setIsLoading] = useState(!cycles);

    const [showAll, setShowAll] = useState(false);
    const visiblePeriods = showAll ? periodData : periodData.slice(0, 3);

    useEffect(() => {
        let isActive = true;

        const hydrateHistory = async () => {
            if (cycles) {
                if (!isActive) return;
                setPeriodData(cycles);
                setIsLoading(false);
                return;
            }

            const periodResult = await queryRowsFromTableCandidates(CYCLE_TABLE_CANDIDATES, 40);

            if (!isActive) return;

            const nextPeriods = cycles
                ? cycles
                : toPeriodCards(periodResult.rows);

            setPeriodData(nextPeriods);
            setIsLoading(false);
        };

        void hydrateHistory();

        return () => {
            isActive = false;
        };
    }, [cycles, logs, user]);

    return (
        <>
            {/* Inject styles once */}
            <style>{css}</style>

            {/* Ranking Period History */}
            <div className="hist-panel">
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <div>
                        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
                            Ranking History
                        </div>
                        <div style={{ fontSize: 12.5, color: "#6b7c70", marginTop: 3 }}>
                            All ranking periods you have participated in or that are currently open
                        </div>
                    </div>
                    <span style={{ background: "#eef7f2", color: "#1a6b3c", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap" }}>
                        {periodData.length} Period{periodData.length !== 1 ? "s" : ""}
                    </span>
                </div>

                <div className="hist-grid">
                    {visiblePeriods.length > 0 ? (
                        visiblePeriods.map((c) => <PeriodCard key={c.id} period={c} />)
                    ) : (
                        <div style={{ gridColumn: "1 / -1", color: "#6b7c70", fontSize: 13, fontStyle: "italic", padding: "6px 2px" }}>
                            {isLoading
                                ? "Loading ranking period history..."
                                : "No ranking periods found for your account yet."}
                        </div>
                    )}
                </div>

                {periodData.length > 3 && (
                    <div style={{ marginTop: 14, textAlign: "right" }}>
                        <button
                            onClick={() => setShowAll(p => !p)}
                            style={{ background: "none", border: "none", color: "#1a6b3c", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'Source Sans 3', sans-serif", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                            {showAll ? "Show less" : "See more"}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
