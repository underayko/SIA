// 📄 SIA/frontend/src/pages/faculty/tabs/Notifications.jsx

import { useState } from "react";

// ─── Styles ──────────────────────────────────────────────────
const css = `
  @keyframes notifFadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .nf-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 16px; flex-wrap: wrap; gap: 10px;
    animation: notifFadeUp 0.35s ease both;
  }

  .nf-filter-tabs {
    display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
    animation: notifFadeUp 0.35s 0.05s ease both;
  }
  .nf-tab {
    padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 600;
    color: #6b7c70; background: #fff; border: 1.5px solid #dde5df;
    cursor: pointer; transition: all 0.15s; user-select: none;
    display: inline-flex; align-items: center; gap: 4px;
    font-family: 'Source Sans 3', sans-serif;
  }
  .nf-tab.active { background: #1a6b3c; color: #fff; border-color: #1a6b3c; }
  .nf-tab:hover:not(.active) { border-color: #1a6b3c; color: #1a6b3c; }

  .nf-mark-btn {
    font-size: 12px; padding: 6px 14px; border-radius: 8px;
    border: 1.5px solid #dde5df; background: #fff; cursor: pointer;
    font-family: 'Source Sans 3', sans-serif; font-weight: 600;
    color: #6b7c70; transition: all 0.15s;
  }
  .nf-mark-btn:hover { border-color: #1a6b3c; color: #1a6b3c; }

  .nf-list {
    display: flex; flex-direction: column;
    background: #fff; border-radius: 14px;
    border: 1px solid #dde5df; overflow: hidden;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    animation: notifFadeUp 0.4s 0.08s ease both;
  }

  .nf-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 18px; border-bottom: 1px solid #f0f3f1;
    position: relative; transition: background 0.15s; cursor: default;
  }
  .nf-item:last-child { border-bottom: none; }
  .nf-item.unread { background: #f5fbf7; }
  .nf-item:hover { background: #eef7f2; }

  .nf-icon {
    width: 40px; height: 40px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .nf-icon.gold  { background: #fdf8ec; }
  .nf-icon.blue  { background: #eaf3fb; }
  .nf-icon.green { background: #eafaf1; }
  .nf-icon.gray  { background: #f1f3f1; }

  .nf-body { flex: 1; min-width: 0; }
  .nf-title { font-size: 13.5px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px; line-height: 1.4; }
  .nf-desc  { font-size: 12.5px; color: #6b7c70; line-height: 1.55; margin-bottom: 5px; }
  .nf-meta  { font-size: 11px; color: #b0bdb5; }

  .nf-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: #1a6b3c; flex-shrink: 0; margin-top: 6px;
  }

  .nf-divider {
    padding: 8px 18px; font-size: 10.5px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    color: #6b7c70; background: #f8f7f4;
    border-bottom: 1px solid #dde5df;
    font-family: 'Source Sans 3', sans-serif;
  }

  .nf-empty {
    padding: 48px 24px; text-align: center;
    color: #6b7c70; font-size: 13px;
    font-family: 'Source Sans 3', sans-serif;
    font-style: italic;
  }
`;

// ─── Mock data ────────────────────────────────────────────────
const MOCK_NOTIFS = [
    {
        id: 1,
        type: "system",
        unread: true,
        icon: "⚠️",
        iconColor: "gold",
        title: "Deadline Reminder — <strong>15 days remaining</strong>",
        desc: "You have 3 areas pending submission. The deadline for 1st Semester AY 2026–2027 is <strong>March 15, 2026</strong>. Complete your application before the cycle closes.",
        meta: "Today, 8:00 AM · System",
        group: null,
    },
    {
        id: 2,
        type: "hr",
        unread: true,
        icon: "🔔",
        iconColor: "blue",
        title: "Ranking Cycle Now Open — <strong>1st Semester AY 2026–2027</strong>",
        desc: "The HR Department has opened the ranking cycle. You may now upload documents for all 10 areas. Download your templates from the Dashboard and submit before the deadline.",
        meta: "Feb 1, 2026 · HR Department",
        group: null,
    },
    {
        id: 3,
        type: "hr",
        unread: false,
        icon: "🏆",
        iconColor: "green",
        title: "Score Published — <strong>86 / 200</strong>",
        desc: "Your ranking score for 2nd Semester AY 2025–2026 has been published by the VPAA. Your current rank of <strong>Instructor I</strong> is retained. Check the Score Breakdown for detailed feedback.",
        meta: "Oct 10, 2025 · VPAA Office",
        group: "Previous Cycle — 2nd Semester AY 2025–2026",
    },
    {
        id: 4,
        type: "hr",
        unread: false,
        icon: "🔍",
        iconColor: "blue",
        title: "VPAA Review Completed",
        desc: "Dr. M. Reyes (VPAA) has reviewed and verified your HR scoring for the previous cycle. Results will be published shortly.",
        meta: "Sep 28, 2025 · VPAA Office",
        group: null,
    },
    {
        id: 5,
        type: "hr",
        unread: false,
        icon: "📋",
        iconColor: "blue",
        title: "HR Scoring Completed",
        desc: "The HR Department has finished scoring all submitted areas for the previous cycle. Your application is now under VPAA review.",
        meta: "Sep 12, 2025 · HR Department",
        group: null,
    },
];

const TABS = ["all", "unread", "system", "hr"];
const TAB_LABELS = { all: "All", unread: "Unread", system: "System", hr: "HR / VPAA" };

// ─── Main Export ──────────────────────────────────────────────
export default function Notifications({ notifications }) {
    const [notifs, setNotifs] = useState(notifications || MOCK_NOTIFS);
    const [activeTab, setActiveTab] = useState("all");

    const unreadCount = notifs.filter(n => n.unread).length;

    const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
    const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));

    const filtered = notifs.filter(n => {
        if (activeTab === "all")    return true;
        if (activeTab === "unread") return n.unread;
        if (activeTab === "system") return n.type === "system";
        if (activeTab === "hr")     return n.type === "hr";
        return true;
    });

    // Group dividers — track which group labels have been rendered
    const renderedGroups = new Set();

    return (
        <>
            <style>{css}</style>

            {/* Header */}
            <div className="nf-header">
                <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 16, fontWeight: 600, color: "#1a1a1a" }}>
                        Notifications
                    </div>
                    <div style={{ fontSize: 12.5, color: "#6b7c70", marginTop: 3, fontFamily: "'Source Sans 3', sans-serif" }}>
                        System alerts, deadline reminders, and HR / VPAA updates
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button className="nf-mark-btn" onClick={markAllRead}>
                        ✓ Mark all as read
                    </button>
                )}
            </div>

            {/* Filter tabs */}
            <div className="nf-filter-tabs">
                {TABS.map(tab => (
                    <span
                        key={tab}
                        className={`nf-tab${activeTab === tab ? " active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {TAB_LABELS[tab]}
                        {tab === "unread" && unreadCount > 0 && (
                            <span style={{ background: activeTab === "unread" ? "rgba(255,255,255,0.3)" : "#1a6b3c", color: "#fff", fontSize: 9, padding: "1px 6px", borderRadius: 8 }}>
                                {unreadCount}
                            </span>
                        )}
                    </span>
                ))}
            </div>

            {/* Notification list */}
            <div className="nf-list">
                {filtered.length === 0 ? (
                    <div className="nf-empty">No notifications in this category.</div>
                ) : (
                    filtered.map(notif => {
                        const showDivider = notif.group && !renderedGroups.has(notif.group);
                        if (notif.group) renderedGroups.add(notif.group);

                        return (
                            <div key={notif.id}>
                                {showDivider && (
                                    <div className="nf-divider">{notif.group}</div>
                                )}
                                <div
                                    className={`nf-item${notif.unread ? " unread" : ""}`}
                                    onClick={() => notif.unread && markRead(notif.id)}
                                >
                                    <div className={`nf-icon ${notif.iconColor}`}>
                                        {notif.icon}
                                    </div>
                                    <div className="nf-body">
                                        <div
                                            className="nf-title"
                                            dangerouslySetInnerHTML={{ __html: notif.title }}
                                        />
                                        <div
                                            className="nf-desc"
                                            dangerouslySetInnerHTML={{ __html: notif.desc }}
                                        />
                                        <div className="nf-meta">{notif.meta}</div>
                                    </div>
                                    {notif.unread && <span className="nf-dot" />}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </>
    );
}
