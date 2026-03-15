import { useState } from "react";
import Login from "./pages/auth/Login";
import ChangePassword from "./pages/auth/ChangePassword";

function App() {
    const [page, setPage] = useState("login");
    const [user, setUser] = useState(null);

    // After login, check if first login → go to change password, else → go to dashboard
    const handleLogin = (firebaseUser) => {
        setUser(firebaseUser);
        // TODO: check firebaseUser.metadata.lastSignInTime === firebaseUser.metadata.creationTime
        // to detect first login. For now, always goes to change password for testing.
        setPage("changePassword");
    };

    const handlePasswordChanged = () => {
        // TODO: redirect to dashboard based on role
        setPage("dashboard");
    };

    if (page === "login") {
        return <Login onLogin={handleLogin} />;
    }

    if (page === "changePassword") {
        return <ChangePassword user={user} onSuccess={handlePasswordChanged} />;
    }

    // TODO: replace this placeholder with actual dashboard routing
    return (
        <div style={{ padding: 40, fontFamily: "sans-serif" }}>
            Dashboard coming soon.
        </div>
    );
}

export default App;

// import ChangePassword from "./pages/auth/ChangePassword";

// function App() {
//     const mockUser = {
//         displayName: "David Bryan B. Candido",
//         email: "202011090@gordoncollege.edu.ph",
//     };

//     return <ChangePassword user={mockUser} onSuccess={() => {}} />;
// }

// export default App;
