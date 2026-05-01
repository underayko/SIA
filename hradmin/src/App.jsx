import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login      from './pages/login';
import Dashboard  from './pages/dashboard';
import Ranking    from './pages/ranking';
import Review     from './pages/review';
import PerfEval   from './pages/perfeval';
import UserMgmt   from './pages/usermanagement';
import ProtectedRoute from './components/ProtectedRoute';
import LoginRedirect from './components/LoginRedirect';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Navigate to="/login" replace />} />
        <Route path="/login"          element={<LoginRedirect><Login /></LoginRedirect>} />
        <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/ranking"        element={<ProtectedRoute><Ranking /></ProtectedRoute>} />
        <Route path="/review"         element={<ProtectedRoute><Review /></ProtectedRoute>} />
        <Route path="/perfeval"       element={<ProtectedRoute><PerfEval /></ProtectedRoute>} />
        <Route path="/usermanagement" element={<ProtectedRoute><UserMgmt /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;