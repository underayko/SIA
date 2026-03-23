// // 📄 SIA/frontend/src/App.jsx

// import { useState } from "react";
// import Login from "./pages/auth/Login";
// import ChangePassword from "./pages/auth/ChangePassword";
// import Dashboard from "./pages/faculty/Dashboard";

// // TODO: once Firebase is connected, replace this entire page-switching system
// // with React Router (npm install react-router-dom) for proper URL-based routing:
// //   /              → Login
// //   /change-password → ChangePassword (protected, redirect if not first login)
// //   /dashboard     → Dashboard (protected, redirect to login if not authenticated)
// //   /dashboard/history      → History tab
// //   /dashboard/profile      → Profile tab
// //   /dashboard/notifications → Notifications tab

// // TODO: wrap the app with Firebase AuthContext so auth state persists on page refresh
// // import { AuthProvider } from "./context/AuthContext";
// // Wrap <App /> in <AuthProvider> inside main.jsx

// function App() {
//     const [page, setPage] = useState("login");
//     const [user, setUser] = useState(null);

//     // Called by Login after successful Firebase sign-in
//     const handleLogin = (firebaseUser) => {
//         setUser(firebaseUser);

//         // TODO: detect first login using Firebase metadata
//         // Firebase sets creationTime and lastSignInTime on the user object.
//         // If they match, it means the user is logging in for the very first time.
//         // const isFirstLogin =
//         //   firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;
//         // if (isFirstLogin) {
//         //   setPage("changePassword");
//         // } else {
//         //   setPage("dashboard");
//         // }

//         // TODO: after first login detection is working, also check user role here
//         // to route HR and VPAA users to their respective dashboards instead of faculty:
//         // const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
//         // const role = userDoc.data().role; // "Faculty" | "HR" | "VPAA"
//         // if (role === "HR")   setPage("hrDashboard");
//         // if (role === "VPAA") setPage("vpaaDashboard");
//         // if (role === "Faculty") setPage("dashboard");

//         // For now — always goes straight to dashboard
//         setPage("dashboard");
//     };

//     // Called by ChangePassword after password is successfully updated
//     const handlePasswordChanged = () => {
//         // TODO: after password change, also update users.is_first_login = false in Firestore
//         // so the first-login flag is cleared and they won't be redirected again
//         // await updateDoc(doc(db, "users", auth.currentUser.uid), { is_first_login: false });
//         setPage("dashboard");
//     };

//     // Called by Dashboard logout button
//     const handleLogout = () => {
//         setUser(null);
//         setPage("login");
//         // TODO: connect Firebase signOut
//         // import { signOut } from "firebase/auth";
//         // import { auth } from "./firebase/auth";
//         // await signOut(auth);
//     };

//     if (page === "login") return <Login onLogin={handleLogin} />;
//     if (page === "changePassword")
//         return <ChangePassword user={user} onSuccess={handlePasswordChanged} />;
//     if (page === "dashboard")
//         return <Dashboard user={user} onLogout={handleLogout} />;

//     // TODO: add HR and VPAA dashboard routes here once Team A and Team C build their portals
//     // if (page === "hrDashboard")   return <HRDashboard user={user} onLogout={handleLogout} />;
//     // if (page === "vpaaDashboard") return <VPAADashboard user={user} onLogout={handleLogout} />;

//     return null;
// }

// export default App;

// ==============================================================================================================

// 📄 DEV ONLY — replace with the real App.jsx before pushing to GitHub
// This file lets you preview any page for screenshots

import { useState } from "react";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";
import Dashboard from "./pages/faculty/Dashboard";

const MOCK_USER = {
    displayName: "David Bryan B. Candido",
    email: "202011090@gordoncollege.edu.ph",
};

const PAGES = [
    { key: "login", label: "Login" },
    { key: "changePassword", label: "Change Password" },
    { key: "dashboard", label: "Dashboard — Home" },
    { key: "history", label: "Dashboard — History" },
    { key: "profile", label: "Dashboard — Profile" },
    { key: "notifications", label: "Dashboard — Notifications" },
];

const switcherStyle = {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    background: "#134f2c",
    borderRadius: 12,
    padding: "8px 12px",
    display: "flex",
    gap: 6,
    flexWrap: "wrap",
    justifyContent: "center",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
};
const btnStyle = (active) => ({
    padding: "5px 12px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    fontFamily: "sans-serif",
    background: active ? "#c9a84c" : "rgba(255,255,255,0.12)",
    color: active ? "#134f2c" : "rgba(255,255,255,0.85)",
    transition: "all 0.15s",
});

export default function App() {
    const [page, setPage] = useState("login");

    const renderPage = () => {
        if (page === "login")
            return <Login onLogin={() => setPage("dashboard")} />;
        if (page === "changePassword")
            return (
                <ChangePassword
                    user={MOCK_USER}
                    onSuccess={() => setPage("dashboard")}
                />
            );

        // Dashboard tabs
        const tabMap = {
            dashboard: "home",
            history: "history",
            profile: "profile",
            notifications: "notifications",
        };
        return (
            <Dashboard
                user={MOCK_USER}
                onLogout={() => setPage("login")}
                _devInitialTab={tabMap[page] || "home"}
            />
        );
    };

    return (
        <>
            {renderPage()}

            {/* Dev page switcher — remove before pushing */}
            <div style={switcherStyle}>
                {PAGES.map((p) => (
                    <button
                        key={p.key}
                        style={btnStyle(page === p.key)}
                        onClick={() => setPage(p.key)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </>
    );
}
