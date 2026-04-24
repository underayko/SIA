import { useEffect, useState } from "react";
import { BarChart3, FileCheck2, Users } from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const USER_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_USER_TABLE_CANDIDATES ||
    "users,faculty_records,faculty_profiles"
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

const CYCLE_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_CYCLE_TABLE_CANDIDATES ||
    "rankingcycles,ranking_cycles,cycles"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

  :root {
    --hr-green: #1a6b3c;
    --hr-green-dark: #134f2c;
    --hr-gold: #c9a84c;
    --hr-bg: #f4f6f3;
    --hr-card: #ffffff;
    --hr-border: #dde5df;
    --hr-text: #1a1a1a;
    --hr-muted: #5f7064;
  }

  .hr-root {
    min-height: 100vh;
    background: radial-gradient(circle at top right, #f9fbf8 0%, var(--hr-bg) 45%, #edf2ee 100%);
    color: var(--hr-text);
    font-family: 'Source Sans 3', sans-serif;
    padding: 24px;
  }

  .hr-shell {
    max-width: 1160px;
    margin: 0 auto;
  }

  .hr-top {
    background: linear-gradient(130deg, var(--hr-green-dark) 0%, var(--hr-green) 62%, #22764c 100%);
    border-radius: 16px;
    color: #fff;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    gap: 16px;
    box-shadow: 0 14px 36px rgba(19, 79, 44, 0.24);
  }

  .hr-badge {
    display: inline-block;
    background: rgba(201, 168, 76, 0.2);
    border: 1px solid rgba(201, 168, 76, 0.45);
    color: #f5df9a;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .hr-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .hr-meta {
    color: rgba(255, 255, 255, 0.8);
    font-size: 13px;
  }

  .hr-logout {
    border: none;
    border-radius: 10px;
    background: #c0392b;
    color: #fff;
    padding: 10px 14px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    align-self: flex-start;
  }

  .hr-nav {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .hr-nav-link {
    text-decoration: none;
    color: var(--hr-muted);
    border: 1px solid var(--hr-border);
    border-radius: 999px;
    background: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
  }

  .hr-nav-link.active {
    background: var(--hr-green);
    color: #fff;
    border-color: var(--hr-green);
  }

  .hr-panel {
    margin-top: 14px;
    background: var(--hr-card);
    border: 1px solid var(--hr-border);
    border-radius: 14px;
    padding: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .hr-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 4px;
  }

  .hr-section-sub {
    color: var(--hr-muted);
    font-size: 13px;
    margin-bottom: 14px;
  }

  .hr-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .hr-card {
    border: 1px solid var(--hr-border);
    border-radius: 12px;
    padding: 14px;
    background: #fbfcfb;
  }

  .hr-card-label {
    color: var(--hr-muted);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .hr-card-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--hr-green-dark);
  }

  .hr-list {
    list-style: none;
    display: grid;
    gap: 8px;
  }

  .hr-item {
    border: 1px solid var(--hr-border);
    border-radius: 10px;
    padding: 10px 12px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
  }

  .hr-item-tag {
    font-size: 11px;
    border-radius: 999px;
    background: #eef7f2;
    border: 1px solid #cfe4d8;
    color: var(--hr-green);
    padding: 2px 8px;
    white-space: nowrap;
  }

    .hr-actions {
        display: flex;
        gap: 6px;
        align-items: center;
    }

    .hr-btn {
        border: 1px solid var(--hr-border);
        border-radius: 8px;
        background: #fff;
        color: var(--hr-muted);
        font-size: 11.5px;
        font-weight: 700;
        padding: 5px 8px;
        cursor: pointer;
    }

    .hr-btn:hover:not(:disabled) {
        border-color: var(--hr-green);
        color: var(--hr-green);
    }

    .hr-btn.endorse:hover:not(:disabled) {
        border-color: var(--hr-green);
        background: #eef7f2;
    }

    .hr-btn.return:hover:not(:disabled) {
        border-color: #c0392b;
        color: #c0392b;
        background: #fdf0ee;
    }

    .hr-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .hr-error {
        margin-top: 10px;
        border: 1px solid #f1c0ba;
        background: #fdf0ee;
        color: #a93226;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
    }

  .hr-empty {
    border: 1px dashed var(--hr-border);
    border-radius: 10px;
    padding: 14px;
    color: var(--hr-muted);
    font-size: 13px;
    background: #fafcfb;
  }

  @media (max-width: 900px) {
    .hr-root { padding: 14px; }
    .hr-title { font-size: 24px; }
    .hr-grid { grid-template-columns: 1fr; }
  }
`;

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

function toBoolean(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "t", "yes", "y", "open"].includes(normalized)) {
            return true;
        }
        if (["false", "f", "no", "n", "closed"].includes(normalized)) {
            return false;
        }
    }
    return fallback;
}

function normalizeStatus(value) {
    return String(value || "draft").trim().toLowerCase();
}

function normalizeRole(value) {
    const normalized = String(value || "Faculty").trim().toUpperCase();
    if (normalized === "HR") return "HR";
    if (normalized === "VPAA") return "VPAA";
    return "Faculty";
}

function toDaysLeft(deadlineValue) {
    const date = new Date(deadlineValue);
    if (Number.isNaN(date.getTime())) return null;

    const diffMs = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / 86400000));
}

function formatCycleLabel(cycle) {
    return String(
        getFirstValue(cycle, ["cycle", "cycle_name", "name"], "Unnamed cycle"),
    );
}

function buildUserIndex(users) {
    const map = new Map();
    for (const row of users) {
        const key = String(getFirstValue(row, ["id", "user_id", "uid"], ""));
        const email = String(getFirstValue(row, ["email", "user_email"], ""));
        const name = String(
            getFirstValue(row, ["full_name", "display_name", "name"], email || key),
        );

        if (key) map.set(key, { name, email });
        if (email) map.set(email, { name, email });
    }
    return map;
}

function toTitleCase(value) {
    const text = String(value || "Pending").replace(/[_-]/g, " ").trim();
    if (!text) return "Pending";
    return text
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function stripUndefined(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined),
    );
}

function isForVerification(status) {
    if (!status) return true;
    if (
        status.includes("approve") ||
        status.includes("reject") ||
        status.includes("retain") ||
        status.includes("endorse") ||
        status.includes("return")
    ) {
        return false;
    }
    return (
        status.includes("submit") ||
        status.includes("review") ||
        status.includes("verify") ||
        status.includes("pending") ||
        status.includes("draft")
    );
}

async function queryRowsWithTableFromCandidates(candidates, limit = 300) {
    for (const table of candidates) {
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

async function queryRowsFromCandidates(candidates, limit = 300) {
    const result = await queryRowsWithTableFromCandidates(candidates, limit);
    return result.rows;
}

function OverviewPage({ metrics, isLoading }) {
    return (
        <section className="hr-panel">
            <h2 className="hr-section-title">Cycle Control Dashboard</h2>
            <p className="hr-section-sub">
                Monitor cycle readiness and faculty submission progress before forwarding to VPAA.
            </p>
            <div className="hr-grid">
                <article className="hr-card">
                    <div className="hr-card-label">
                        <Users size={14} /> Faculty Accounts
                    </div>
                    <div className="hr-card-value">{isLoading ? "..." : metrics.facultyCount}</div>
                </article>
                <article className="hr-card">
                    <div className="hr-card-label">
                        <FileCheck2 size={14} /> Submitted Applications
                    </div>
                    <div className="hr-card-value">{isLoading ? "..." : metrics.submittedCount}</div>
                </article>
                <article className="hr-card">
                    <div className="hr-card-label">
                        <BarChart3 size={14} /> For Verification
                    </div>
                    <div className="hr-card-value">{isLoading ? "..." : metrics.verificationCount}</div>
                </article>
            </div>
        </section>
    );
}

function CyclesPage({ cycles, isLoading }) {
    return (
        <section className="hr-panel">
            <h2 className="hr-section-title">Ranking Cycles</h2>
            <p className="hr-section-sub">
                Open or close submission windows and monitor deadline adherence.
            </p>
            {isLoading ? (
                <div className="hr-empty">Loading cycle settings...</div>
            ) : cycles.length === 0 ? (
                <div className="hr-empty">No cycle records found yet.</div>
            ) : (
                <ul className="hr-list">
                    {cycles.map((cycle) => (
                        <li className="hr-item" key={cycle.id}>
                            <span>{cycle.label}</span>
                            <span className="hr-item-tag">{cycle.tag}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function ReviewsPage({
    reviewRows,
    isLoading,
    onAction,
    actingAction,
    errorMessage,
}) {
    return (
        <section className="hr-panel">
            <h2 className="hr-section-title">HR Review Queue</h2>
            <p className="hr-section-sub">
                Prioritized list of applications requiring scoring review and document checks.
            </p>
            {isLoading ? (
                <div className="hr-empty">Loading review queue...</div>
            ) : reviewRows.length === 0 ? (
                <div className="hr-empty">No review items are pending right now.</div>
            ) : (
                <ul className="hr-list">
                    {reviewRows.map((item) => (
                        <li className="hr-item" key={item.id}>
                            <span>{item.text}</span>
                            <div className="hr-actions">
                                <span className="hr-item-tag">{item.tag}</span>
                                <button
                                    type="button"
                                    className="hr-btn endorse"
                                    onClick={() => onAction(item, "Endorsed to VPAA")}
                                    disabled={
                                        !item.dbId ||
                                        Boolean(actingAction)
                                    }
                                >
                                    {actingAction === `${item.id}:Endorsed to VPAA`
                                        ? "Saving..."
                                        : "Endorse"}
                                </button>
                                <button
                                    type="button"
                                    className="hr-btn return"
                                    onClick={() =>
                                        onAction(item, "Returned to Faculty")
                                    }
                                    disabled={
                                        !item.dbId ||
                                        Boolean(actingAction)
                                    }
                                >
                                    {actingAction === `${item.id}:Returned to Faculty`
                                        ? "Saving..."
                                        : "Return"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {errorMessage && <div className="hr-error">{errorMessage}</div>}
        </section>
    );
}

export default function HrDashboard({ user, onLogout }) {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        facultyCount: 0,
        submittedCount: 0,
        verificationCount: 0,
    });
    const [cycles, setCycles] = useState([]);
    const [reviewRows, setReviewRows] = useState([]);
    const [applicationTable, setApplicationTable] = useState(null);
    const [actingAction, setActingAction] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const handleReviewAction = async (item, nextStatus) => {
        if (!item?.dbId || !applicationTable) return;

        const actionKey = `${item.id}:${nextStatus}`;
        setActingAction(actionKey);
        setErrorMessage("");

        try {
            const nowIso = new Date().toISOString();
            const payloadVariants = [
                stripUndefined({ status: nextStatus, updated_at: nowIso }),
                stripUndefined({ application_status: nextStatus, updated_at: nowIso }),
                stripUndefined({ state: nextStatus, updated_at: nowIso }),
                stripUndefined({ status: nextStatus }),
                stripUndefined({ application_status: nextStatus }),
                stripUndefined({ state: nextStatus }),
            ];

            const idPairs = [
                ["id", item.dbId],
                ["application_id", item.dbId],
            ];

            let updated = false;
            for (const [idColumn, idValue] of idPairs) {
                for (const payload of payloadVariants) {
                    const result = await supabase
                        .from(applicationTable)
                        .update(payload)
                        .eq(idColumn, idValue)
                        .select("id");

                    if (!result.error && Array.isArray(result.data) && result.data.length > 0) {
                        updated = true;
                        break;
                    }
                }

                if (updated) break;
            }

            if (!updated) {
                setErrorMessage("Unable to update application status right now.");
                return;
            }

            setReloadKey((prev) => prev + 1);
        } catch {
            setErrorMessage("Unable to update application status right now.");
        } finally {
            setActingAction("");
        }
    };

    useEffect(() => {
        let isActive = true;

        const hydrate = async () => {
            setIsLoading(true);
            setErrorMessage("");

            const [users, appResult, cycleRows] = await Promise.all([
                queryRowsFromCandidates(USER_TABLE_CANDIDATES),
                queryRowsWithTableFromCandidates(APPLICATION_TABLE_CANDIDATES),
                queryRowsFromCandidates(CYCLE_TABLE_CANDIDATES),
            ]);

            const applications = appResult.rows;
            const applicationSourceTable = appResult.table;

            if (!isActive) return;

            const facultyCountRaw = users.filter((row) => {
                const role = normalizeRole(
                    getFirstValue(row, ["role", "user_role", "account_role", "portal_role"], "Faculty"),
                );
                return role === "Faculty";
            }).length;

            const userIndex = buildUserIndex(users);
            const normalizedApplications = applications.map((row, index) => {
                const status = normalizeStatus(
                    getFirstValue(row, ["status", "application_status", "state"], "draft"),
                );
                const id = String(getFirstValue(row, ["id", "application_id"], index + 1));
                const userId = String(
                    getFirstValue(row, ["user_id", "faculty_id", "uid", "applicant_id"], ""),
                );
                const email = String(getFirstValue(row, ["email", "user_email"], ""));

                const inlineName = String(
                    getFirstValue(row, ["full_name", "name", "applicant_name", "faculty_name"], ""),
                );
                const person = userIndex.get(userId) || userIndex.get(email) || null;
                const name = inlineName || person?.name || person?.email || `Applicant ${id}`;

                const targetRank = String(
                    getFirstValue(row, ["target_rank", "applying_for", "position_name"], "Target rank"),
                );

                const dbId = getFirstValue(row, ["id", "application_id"], null);

                return {
                    id,
                    dbId,
                    status,
                    text: `${name} · ${targetRank}`,
                    tag: toTitleCase(status),
                };
            });

            const submittedCount = normalizedApplications.filter((row) =>
                row.status.includes("submit"),
            ).length;

            const verificationRows = normalizedApplications.filter((row) =>
                isForVerification(row.status),
            );

            const mappedCycles = cycleRows.slice(0, 5).map((cycle, index) => {
                const id = String(getFirstValue(cycle, ["id", "cycle_id"], index + 1));
                const label = formatCycleLabel(cycle);
                const deadline = getFirstValue(cycle, [
                    "deadline",
                    "deadline_at",
                    "submission_deadline",
                    "end_date",
                    "closing_date",
                ]);
                const isOpen = toBoolean(
                    getFirstValue(cycle, ["submission_open", "is_open", "open"], false),
                    false,
                );
                const daysLeft = toDaysLeft(deadline);
                const tag = isOpen
                    ? `Open${typeof daysLeft === "number" ? ` · ${daysLeft} days left` : ""}`
                    : "Closed";

                return { id, label, tag };
            });

            setMetrics({
                facultyCount: facultyCountRaw > 0 ? facultyCountRaw : users.length,
                submittedCount,
                verificationCount: verificationRows.length,
            });
            setApplicationTable(applicationSourceTable);
            setCycles(mappedCycles);
            setReviewRows(verificationRows.slice(0, 6));
            setIsLoading(false);
        };

        void hydrate();

        return () => {
            isActive = false;
        };
    }, [reloadKey]);

    return (
        <>
            <style>{styles}</style>
            <div className="hr-root">
                <div className="hr-shell">
                    <header className="hr-top">
                        <div>
                            <span className="hr-badge">HR portal</span>
                            <h1 className="hr-title">Human Resources Panel</h1>
                            <p className="hr-meta">
                                Signed in as {user?.email || "hr@gordoncollege.edu.ph"}
                            </p>
                        </div>
                        <button className="hr-logout" onClick={onLogout}>
                            Sign out
                        </button>
                    </header>

                    <nav className="hr-nav" aria-label="HR sections">
                        <NavLink
                            to="/hr/overview"
                            className={({ isActive }) => `hr-nav-link${isActive ? " active" : ""}`}
                        >
                            Overview
                        </NavLink>
                        <NavLink
                            to="/hr/cycles"
                            className={({ isActive }) => `hr-nav-link${isActive ? " active" : ""}`}
                        >
                            Cycle Settings
                        </NavLink>
                        <NavLink
                            to="/hr/reviews"
                            className={({ isActive }) => `hr-nav-link${isActive ? " active" : ""}`}
                        >
                            Review Queue
                        </NavLink>
                    </nav>

                    <Routes>
                        <Route
                            path="overview"
                            element={<OverviewPage metrics={metrics} isLoading={isLoading} />}
                        />
                        <Route
                            path="cycles"
                            element={<CyclesPage cycles={cycles} isLoading={isLoading} />}
                        />
                        <Route
                            path="reviews"
                            element={
                                <ReviewsPage
                                    reviewRows={reviewRows}
                                    isLoading={isLoading}
                                    onAction={handleReviewAction}
                                    actingAction={actingAction}
                                    errorMessage={errorMessage}
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/hr/overview" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}
