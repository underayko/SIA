import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login      from './pages/login';
import Dashboard  from './pages/dashboard';
// import Ranking    from './pages/ranking';
// import Review     from './pages/review';
// import UserMgmt   from './pages/usermanagement';
// import Submission from './pages/submission';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Navigate to="/login" replace />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        {/* <Route path="/ranking"        element={<Ranking />} />
        <Route path="/review"         element={<Review />} />
        <Route path="/usermanagement" element={<UserMgmt />} />
        <Route path="/submission"     element={<Submission />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;