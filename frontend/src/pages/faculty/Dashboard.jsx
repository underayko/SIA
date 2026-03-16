// 📄 SIA/frontend/src/pages/faculty/Dashboard.jsx

import { useState } from "react";
import gcLogo from "../../assets/gclogo.png";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Home from "./tabs/Home";
import History from "./tabs/History";
import Profile from "./tabs/Profile";
import Notifications from "./tabs/Notifications";
import { LogOut } from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --gc-green: #1a6b3c;
    --gc-green-dark: #134f2c;
    --surface: #f1f3f1;
    --white: #ffffff;
    --text-dark: #1a1a1a;
    --text-muted: #6b7c70;
    --border: #dde5df;
    --danger: #c0392b;
    --sidebar-w: 240px;
  }

  .db-root {
    font-family: 'Source Sans 3', sans-serif;
    background: var(--surface);
    color: var(--text-dark);
    display: flex;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Main content */
  .db-main {
    margin-left: var(--sidebar-w);
    flex: 1; display: flex; flex-direction: column; min-height: 100vh;
  }

  .db-page { padding: 24px 28px 40px; }

  /* ── Logout modal ── */
  .db-logout-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.45); z-index: 999;
    align-items: center; justify-content: center;
  }
  .db-logout-overlay.open { display: flex; }
  .db-logout-box {
    background: var(--white); border-radius: 16px;
    padding: 32px 28px; width: 100%; max-width: 360px; margin: 24px;
    text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: dbScaleIn 0.2s ease;
  }
  .db-lm-icon {
    width: 52px; height: 52px; border-radius: 50%;
    background: #fef0f0; border: 2px solid #f5c6c6;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; margin: 0 auto 16px;
  }
  .db-lm-title {
    font-family: 'Playfair Display', serif; font-size: 20px;
    font-weight: 600; color: var(--text-dark); margin-bottom: 8px;
  }
  .db-lm-desc { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
  .db-lm-actions { display: flex; gap: 10px; }
  .db-lm-cancel {
    flex: 1; padding: 11px; border-radius: 9px;
    border: 1.5px solid var(--border); background: var(--white);
    font-size: 14px; font-weight: 600; color: var(--text-muted);
    cursor: pointer; font-family: 'Source Sans 3', sans-serif;
    transition: background 0.15s;
  }
  .db-lm-cancel:hover { background: #f8f7f4; }
  .db-lm-confirm {
    flex: 1; padding: 11px; border-radius: 9px; border: none;
    background: linear-gradient(135deg, #c0392b, #e74c3c);
    font-size: 14px; font-weight: 600; color: var(--white);
    cursor: pointer; font-family: 'Source Sans 3', sans-serif;
    box-shadow: 0 4px 14px rgba(192,57,43,0.3);
    transition: opacity 0.15s, transform 0.15s;
  }
  .db-lm-confirm:hover { opacity: 0.9; transform: translateY(-1px); }

  @media (max-width: 900px) {
    .db-main { margin-left: 0; }
    /* Extra bottom padding so content doesn't hide behind the bottom nav */
    .db-page { padding: 16px 16px 88px; }
  }

  @keyframes dbScaleIn {
    from { opacity: 0; transform: scale(0.93); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

const PAGE_TITLES = {
    home: "Dashboard",
    history: "History & Logs",
    profile: "My Profile",
    notifications: "Notifications",
};

export default function Dashboard({ user, onLogout }) {
    const [activeTab, setActiveTab] = useState("home");
    const [showLogout, setShowLogout] = useState(false);
    const [notifCount, setNotifCount] = useState(2);

    const navigate = (key) => {
        setActiveTab(key);
        if (key === "notifications") setNotifCount(0);
    };

    const renderTab = () => {
        switch (activeTab) {
            case "home":
                return <Home user={user} onNavigate={navigate} />;
            case "history":
                return <History user={user} />;
            case "profile":
                return <Profile user={user} />;
            case "notifications":
                return <Notifications user={user} />;
            default:
                return <Home user={user} onNavigate={navigate} />;
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="db-root">
                {/* Sidebar — desktop sidebar + mobile bottom nav */}
                <Sidebar
                    activeTab={activeTab}
                    onNavigate={navigate}
                    onLogout={() => setShowLogout(true)}
                    notifCount={notifCount}
                    logo={gcLogo}
                />

                {/* Main */}
                <div className="db-main">
                    <Topbar
                        title={PAGE_TITLES[activeTab]}
                        user={user}
                        notifCount={notifCount}
                        onMarkAllRead={() => setNotifCount(0)}
                        onViewAllNotifs={() => navigate("notifications")}
                        onLogout={() => setShowLogout(true)}
                    />

                    <main className="db-page">{renderTab()}</main>
                </div>

                {/* Logout modal */}
                <div
                    className={`db-logout-overlay${showLogout ? " open" : ""}`}
                    onClick={() => setShowLogout(false)}
                >
                    <div
                        className="db-logout-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="db-lm-icon">
                            <LogOut size={15} color="#c0392b" />
                        </div>
                        <div className="db-lm-title">Log Out?</div>
                        <div className="db-lm-desc">
                            You will be returned to the login page. Any unsaved
                            progress will remain as-is.
                        </div>
                        <div className="db-lm-actions">
                            <button
                                className="db-lm-cancel"
                                onClick={() => setShowLogout(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="db-lm-confirm"
                                onClick={() => {
                                    setShowLogout(false);
                                    if (onLogout) onLogout();
                                }}
                            >
                                Yes, Log Out
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
