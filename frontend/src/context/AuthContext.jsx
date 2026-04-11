// The app has three different portals. After login, the app needs to know:

// Is this person HR? → send them to pages/hr/
// Is this person Faculty? → send them to pages/faculty/
// Is this person VPAA? → send them to pages/vpaa/

// The role-checking logic lives in context/AuthContext.jsx and App.jsx reads it to decide which page to show.
// example

// =====================================================================

// import { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../lib/supabase";

// const AuthContext = createContext();

// export function AuthProvider({ children }) {
//     const [user, setUser] = useState(null);

//     useEffect(() => {
//         const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
//             setUser(session?.user ?? null);
//         });
//         return () => {
//             listener?.unsubscribe();
//         };
//     }, []);

//     return (
//         <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
//     );
// }

// export function useAuth() {
//     return useContext(AuthContext);
// }

// =====================================================================

// Then in any page, any team can just do this:
// jsximport { useAuth } from "../../context/AuthContext";

// function Dashboard() {
//   const { user } = useAuth();

//   return <h1>Welcome, {user.email}</h1>;
// }
