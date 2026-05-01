import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, Eye, Files, ShieldCheck, TrendingUp } from "lucide-react";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { supabase } from "../../lib/supabase";

const APPLICATION_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_APPLICATION_TABLE_CANDIDATES ||
    "applications,ranking_applications,faculty_applications"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

const USER_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_USER_TABLE_CANDIDATES ||
    "users,faculty_records,faculty_profiles"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
const AREA_SUBMISSION_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_AREA_SUBMISSION_TABLE_CANDIDATES ||
    "areasubmissions,area_submissions,submissions"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
const SUBMISSIONS_BUCKET =
    import.meta.env.VITE_SUPABASE_SUBMISSIONS_BUCKET || "submissions";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

  :root {
    --vp-green: #1f5b3d;
    --vp-navy: #1f3f56;
    --vp-gold: #c9a84c;
    --vp-bg: #f3f5f7;
    --vp-card: #ffffff;
    --vp-border: #d7dee3;
    --vp-text: #1a1a1a;
    --vp-muted: #5d6a74;
  }

  .vp-root {
    min-height: 100vh;
    background: linear-gradient(160deg, #f5f7f8 0%, #eff3f6 52%, #e9eff2 100%);
    font-family: 'Source Sans 3', sans-serif;
    color: var(--vp-text);
    padding: 24px;
  }

  .vp-shell {
    max-width: 1160px;
    margin: 0 auto;
  }

  .vp-top {
    border-radius: 16px;
    padding: 20px;
    background: linear-gradient(135deg, var(--vp-navy) 0%, #2f5f80 60%, #37739a 100%);
    color: #fff;
    box-shadow: 0 14px 38px rgba(31, 63, 86, 0.24);
    display: flex;
    justify-content: space-between;
    gap: 16px;
  }

  .vp-badge {
    display: inline-block;
    background: rgba(201, 168, 76, 0.2);
    border: 1px solid rgba(201, 168, 76, 0.4);
    color: #f5df9a;
    border-radius: 999px;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .vp-title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    line-height: 1.1;
    margin-bottom: 6px;
  }

  .vp-meta {
    color: rgba(255, 255, 255, 0.82);
    font-size: 13px;
  }

  .vp-logout {
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

  .vp-nav {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .vp-nav-link {
    text-decoration: none;
    color: var(--vp-muted);
    border: 1px solid var(--vp-border);
    border-radius: 999px;
    background: #fff;
    padding: 8px 14px;
    font-size: 13px;
    font-weight: 600;
  }

  .vp-nav-link.active {
    background: var(--vp-navy);
    border-color: var(--vp-navy);
    color: #fff;
  }

  .vp-panel {
    margin-top: 14px;
    border-radius: 14px;
    border: 1px solid var(--vp-border);
    background: var(--vp-card);
    padding: 18px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  }

  .vp-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    margin-bottom: 4px;
  }

  .vp-section-sub {
    color: var(--vp-muted);
    font-size: 13px;
    margin-bottom: 14px;
  }

  .vp-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .vp-card {
    border: 1px solid var(--vp-border);
    border-radius: 12px;
    padding: 14px;
    background: #fbfdff;
  }

  .vp-card-label {
    color: var(--vp-muted);
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .vp-card-value {
    font-size: 24px;
    font-weight: 700;
    color: #244f6f;
  }

  .vp-list {
    list-style: none;
    display: grid;
    gap: 8px;
  }

  .vp-item {
    border: 1px solid var(--vp-border);
    border-radius: 10px;
    padding: 10px 12px;
    background: #fff;
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 13px;
  }

  .vp-tag {
    font-size: 11px;
    border-radius: 999px;
    background: #eef4fa;
    border: 1px solid #cfdeea;
    color: #2f5f80;
    padding: 2px 8px;
    white-space: nowrap;
  }

    .vp-actions {
        display: flex;
        gap: 6px;
        align-items: center;
    }

        .vp-actions.wrap {
            flex-wrap: wrap;
            justify-content: flex-end;
        }

    .vp-btn {
        border: 1px solid var(--vp-border);
        border-radius: 8px;
        background: #fff;
        color: var(--vp-muted);
        font-size: 11.5px;
        font-weight: 700;
        padding: 5px 8px;
        cursor: pointer;
    }

    .vp-btn:hover:not(:disabled) {
        border-color: var(--vp-navy);
        color: var(--vp-navy);
    }

    .vp-btn.approve:hover:not(:disabled) {
        border-color: #1f5b3d;
        color: #1f5b3d;
        background: #eef7f2;
    }

    .vp-btn.return:hover:not(:disabled) {
        border-color: #c0392b;
        color: #c0392b;
        background: #fdf0ee;
    }

    .vp-btn.file:hover:not(:disabled) {
        border-color: #1f3f56;
        color: #1f3f56;
        background: #eef4fa;
    }

    .vp-btn:disabled {
        opacity: 0.45;
        cursor: not-allowed;
    }

    .vp-error {
        margin-top: 10px;
        border: 1px solid #f1c0ba;
        background: #fdf0ee;
        color: #a93226;
        border-radius: 8px;
        padding: 8px 10px;
        font-size: 12px;
    }

  .vp-empty {
    border: 1px dashed var(--vp-border);
    border-radius: 10px;
    padding: 14px;
    color: var(--vp-muted);
    font-size: 13px;
    background: #fafcfe;
  }

  @media (max-width: 900px) {
    .vp-root { padding: 14px; }
    .vp-title { font-size: 24px; }
    .vp-grid { grid-template-columns: 1fr; }
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

function normalizeStatus(value) {
    return String(value || "draft").trim().toLowerCase();
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

function isFinalized(status) {
    return (
        status.includes("approve") ||
        status.includes("reject") ||
        status.includes("retain") ||
        status.includes("return") ||
        status.includes("final") ||
        status.includes("complete")
    );
}

function isRecommendationQueue(status) {
    if (isFinalized(status)) return false;
    return (
        status.includes("vpaa") ||
        status.includes("endorse") ||
        status.includes("review") ||
        status.includes("submit")
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

function OverviewPage({ metrics, isLoading }) {
    return (
        <section className="vp-panel">
            <h2 className="vp-section-title">VPAA Approval Summary</h2>
            <p className="vp-section-sub">
                Final review metrics for applications elevated by Human Resources.
            </p>
            <div className="vp-grid">
                <article className="vp-card">
                    <div className="vp-card-label">
                        <ClipboardList size={14} /> Total Endorsed
                    </div>
                    <div className="vp-card-value">{isLoading ? "..." : metrics.endorsedCount}</div>
                </article>
                <article className="vp-card">
                    <div className="vp-card-label">
                        <CheckCircle2 size={14} /> Finalized
                    </div>
                    <div className="vp-card-value">{isLoading ? "..." : metrics.finalizedCount}</div>
                </article>
                <article className="vp-card">
                    <div className="vp-card-label">
                        <TrendingUp size={14} /> Promotion Rate
                    </div>
                    <div className="vp-card-value">{isLoading ? "..." : `${metrics.promotionRate}%`}</div>
                </article>
            </div>
        </section>
    );
}

function fileNameFromPath(value) {
    const text = String(value || "").trim();
    if (!text) return "Attached file";
    return text.split("/").filter(Boolean).pop() || text;
}

function SubmissionsPage({ rows, isLoading, onOpenFile, openingId, errorMessage }) {
    return (
        <section className="vp-panel">
            <h2 className="vp-section-title">
                <Files size={16} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                Submitted Files
            </h2>
            <p className="vp-section-sub">
                Open uploaded faculty files from the `area_submissions` table.
            </p>
            {isLoading ? (
                <div className="vp-empty">Loading submitted files...</div>
            ) : rows.length === 0 ? (
                <div className="vp-empty">No submitted files found yet.</div>
            ) : (
                <ul className="vp-list">
                    {rows.map((item) => (
                        <li className="vp-item" key={item.id}>
                            <span>{item.text}</span>
                            <div className="vp-actions wrap">
                                <span className="vp-tag">{item.tag}</span>
                                <button
                                    type="button"
                                    className="vp-btn file"
                                    onClick={() => onOpenFile(item)}
                                    disabled={Boolean(openingId)}
                                >
                                    <Eye size={12} /> {openingId === item.id ? "Opening..." : "Open File"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {errorMessage && <div className="vp-error">{errorMessage}</div>}
        </section>
    );
}

function RecommendationsPage({
    rows,
    isLoading,
    onAction,
    actingAction,
    errorMessage,
}) {
    return (
        <section className="vp-panel">
            <h2 className="vp-section-title">Recommendations Queue</h2>
            <p className="vp-section-sub">
                Applications awaiting VPAA recommendation notes before final sign-off.
            </p>
            {isLoading ? (
                <div className="vp-empty">Loading recommendation queue...</div>
            ) : rows.length === 0 ? (
                <div className="vp-empty">No items currently queued for VPAA recommendations.</div>
            ) : (
                <ul className="vp-list">
                    {rows.map((item) => (
                        <li className="vp-item" key={item.id}>
                            <span>{item.text}</span>
                            <div className="vp-actions">
                                <span className="vp-tag">{item.tag}</span>
                                <button
                                    type="button"
                                    className="vp-btn approve"
                                    onClick={() =>
                                        onAction(item, "Approved for Promotion")
                                    }
                                    disabled={!item.dbId || Boolean(actingAction)}
                                >
                                    {actingAction === `${item.id}:Approved for Promotion`
                                        ? "Saving..."
                                        : "Approve"}
                                </button>
                                <button
                                    type="button"
                                    className="vp-btn"
                                    onClick={() => onAction(item, "Rank Retained")}
                                    disabled={!item.dbId || Boolean(actingAction)}
                                >
                                    {actingAction === `${item.id}:Rank Retained`
                                        ? "Saving..."
                                        : "Retain"}
                                </button>
                                <button
                                    type="button"
                                    className="vp-btn return"
                                    onClick={() => onAction(item, "Returned to HR")}
                                    disabled={!item.dbId || Boolean(actingAction)}
                                >
                                    {actingAction === `${item.id}:Returned to HR`
                                        ? "Saving..."
                                        : "Return"}
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {errorMessage && <div className="vp-error">{errorMessage}</div>}
        </section>
    );
}

function FinalizationPage({ rows, isLoading }) {
    return (
        <section className="vp-panel">
            <h2 className="vp-section-title">Final Decision Log</h2>
            <p className="vp-section-sub">
                Completed VPAA actions ready for issuance and records archiving.
            </p>
            {isLoading ? (
                <div className="vp-empty">Loading final decisions...</div>
            ) : rows.length === 0 ? (
                <div className="vp-empty">No finalized decisions yet for this cycle.</div>
            ) : (
                <ul className="vp-list">
                    {rows.map((item) => (
                        <li className="vp-item" key={item.id}>
                            <span>{item.text}</span>
                            <span className="vp-tag">{item.tag}</span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default function VpaaDashboard({ user, onLogout }) {
    const [isLoading, setIsLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        endorsedCount: 0,
        finalizedCount: 0,
        promotionRate: 0,
    });
    const [recommendationRows, setRecommendationRows] = useState([]);
    const [finalizationRows, setFinalizationRows] = useState([]);
    const [submissionRows, setSubmissionRows] = useState([]);
    const [applicationTable, setApplicationTable] = useState(null);
    const [actingAction, setActingAction] = useState("");
    const [openingId, setOpeningId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [reloadKey, setReloadKey] = useState(0);

    const openSubmissionFile = async (item) => {
        if (!item?.filePath) return;

        setOpeningId(item.id);
        setErrorMessage("");
        try {
            const signed = await supabase.storage
                .from(SUBMISSIONS_BUCKET)
                .createSignedUrl(item.filePath, 3600);

            if (!signed.error && signed.data?.signedUrl) {
                window.open(signed.data.signedUrl, "_blank", "noopener,noreferrer");
            } else {
                setErrorMessage("Unable to open that submitted file right now.");
            }
        } catch {
            setErrorMessage("Unable to open that submitted file right now.");
        } finally {
            setOpeningId("");
        }
    };

    const handleRecommendationAction = async (item, nextStatus) => {
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
                setErrorMessage("Unable to update recommendation status right now.");
                return;
            }

            setReloadKey((prev) => prev + 1);
        } catch {
            setErrorMessage("Unable to update recommendation status right now.");
        } finally {
            setActingAction("");
        }
    };

    useEffect(() => {
        let isActive = true;

        const hydrate = async () => {
            setIsLoading(true);
            setErrorMessage("");

            const [appResult, users, submissionResult] = await Promise.all([
                queryRowsWithTableFromCandidates(APPLICATION_TABLE_CANDIDATES),
                queryRowsFromCandidates(USER_TABLE_CANDIDATES),
                queryRowsWithTableFromCandidates(AREA_SUBMISSION_TABLE_CANDIDATES),
            ]);

            const applications = appResult.rows;
            const applicationSourceTable = appResult.table;

            if (!isActive) return;

            const userIndex = buildUserIndex(users);
            const applicationIndex = new Map();
            const normalized = applications.map((row, index) => {
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

                if (dbId !== null && dbId !== undefined) {
                    applicationIndex.set(String(dbId), { name, targetRank, id });
                }

                return {
                    id,
                    dbId,
                    status,
                    text: `${name} · ${targetRank}`,
                    tag: toTitleCase(status),
                };
            });

            const finalized = normalized.filter((row) => isFinalized(row.status));
            const recommendationQueue = normalized.filter((row) =>
                isRecommendationQueue(row.status),
            );

            const normalizedSubmissions = submissionResult.rows.map((row, index) => {
                const filePath = String(
                    getFirstValue(row, ["file_path", "storage_path", "path", "object_path"], ""),
                );
                const applicationId = String(
                    getFirstValue(row, ["application_id", "applicationId"], ""),
                );
                const areaId = String(getFirstValue(row, ["area_id", "areaId"], "Area"));
                const application = applicationIndex.get(applicationId) || null;
                const fileName = fileNameFromPath(filePath);
                const id = String(getFirstValue(row, ["submission_id", "id"], index + 1));

                return {
                    id,
                    filePath,
                    text: `${application?.name || `Application ${applicationId || id}`} · ${areaId} · ${fileName}`,
                    tag: `Submitted${application?.targetRank ? ` · ${application.targetRank}` : ""}`,
                };
            });

            const approved = finalized.filter((row) =>
                row.status.includes("approve") || row.status.includes("promot"),
            ).length;
            const promotionRate =
                finalized.length > 0
                    ? Math.round((approved / finalized.length) * 100)
                    : 0;

            setMetrics({
                endorsedCount: recommendationQueue.length,
                finalizedCount: finalized.length,
                promotionRate,
            });
            setApplicationTable(applicationSourceTable);
            setRecommendationRows(recommendationQueue.slice(0, 6));
            setFinalizationRows(finalized.slice(0, 6));
            setSubmissionRows(normalizedSubmissions.slice(0, 12));
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
            <div className="vp-root">
                <div className="vp-shell">
                    <header className="vp-top">
                        <div>
                            <span className="vp-badge">VPAA portal</span>
                            <h1 className="vp-title">Vice President for Academic Affairs</h1>
                            <p className="vp-meta">
                                Signed in as {user?.email || "vpaa@gordoncollege.edu.ph"}
                            </p>
                        </div>
                        <button className="vp-logout" onClick={onLogout}>
                            Sign out
                        </button>
                    </header>

                    <nav className="vp-nav" aria-label="VPAA sections">
                        <NavLink
                            to="/vpaa/overview"
                            className={({ isActive }) => `vp-nav-link${isActive ? " active" : ""}`}
                        >
                            Overview
                        </NavLink>
                        <NavLink
                            to="/vpaa/recommendations"
                            className={({ isActive }) => `vp-nav-link${isActive ? " active" : ""}`}
                        >
                            Recommendations
                        </NavLink>
                        <NavLink
                            to="/vpaa/finalization"
                            className={({ isActive }) => `vp-nav-link${isActive ? " active" : ""}`}
                        >
                            Finalization
                        </NavLink>
                        <NavLink
                            to="/vpaa/submissions"
                            className={({ isActive }) => `vp-nav-link${isActive ? " active" : ""}`}
                        >
                            Submitted Files
                        </NavLink>
                    </nav>

                    <Routes>
                        <Route
                            path="overview"
                            element={<OverviewPage metrics={metrics} isLoading={isLoading} />}
                        />
                        <Route
                            path="recommendations"
                            element={
                                <RecommendationsPage
                                    rows={recommendationRows}
                                    isLoading={isLoading}
                                    onAction={handleRecommendationAction}
                                    actingAction={actingAction}
                                    errorMessage={errorMessage}
                                />
                            }
                        />
                        <Route
                            path="finalization"
                            element={
                                <FinalizationPage
                                    rows={finalizationRows}
                                    isLoading={isLoading}
                                />
                            }
                        />
                        <Route
                            path="submissions"
                            element={
                                <SubmissionsPage
                                    rows={submissionRows}
                                    isLoading={isLoading}
                                    onOpenFile={openSubmissionFile}
                                    openingId={openingId}
                                    errorMessage={errorMessage}
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/vpaa/overview" replace />} />
                    </Routes>
                </div>
            </div>
        </>
    );
}
