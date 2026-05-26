import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Writers from './pages/Writers';
import UserDetail from './pages/UserDetail';
import Sessions from './pages/Sessions';
import Resources from './pages/Resources';
import FeedbackPage from './pages/Feedback';
import Health from './pages/Health';
import Settings from './pages/Settings';
import TestManagement from './pages/TestManagement';
import TestTelemetry from './pages/TestTelemetry';
import B2BManagement from './pages/B2BManagement';
import Cheatsheets from './pages/Cheatsheets';
import CutoffsManagement from './pages/CutoffsManagement';
import ExamManagement from './pages/ExamManagement';
import StudyMaterials from './pages/StudyMaterials';
import Layout from './components/Layout';

import BattleQuestions from './pages/BattleQuestions';
import UTMGenerator from './pages/UTMGenerator';
import LinkShortener from './pages/LinkShortener';
import MetaPreviewer from './pages/MetaPreviewer';
import UserSegmentation from './pages/UserSegmentation';

export const AuthCtx = createContext(null);

const getAdminBasename = () => {
  // Auto-detect the admin base path from the current URL at runtime.
  // The server serves this SPA at ADMIN_PATH, so the first path segment
  // (e.g. "/adminurl") IS the base. This means changing ADMIN_PATH in
  // the server's .env and restarting is all you need — no rebuild required.
  if (typeof window !== 'undefined' && window.__ADMIN_BASE__) {
    return window.__ADMIN_BASE__;
  }
  const path = window.location.pathname;
  // Extract the first path segment as the basename (e.g. "/adminurl" from "/adminurl/dashboard")
  const match = path.match(/^(\/[^/]+)/);
  return match ? match[1] : '/';
};

function PrivateRoute({ children }) {
  const { user } = useContext(AuthCtx);
  return user ? children : <Navigate to="/" replace />;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); } catch { return null; }
  });

  const login = (userData) => {
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, login, logout }}>
      <BrowserRouter basename={getAdminBasename()}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/writers" element={<Writers />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/tests" element={<TestManagement />} />
            <Route path="/test-telemetry" element={<TestTelemetry />} />
            <Route path="/b2b" element={<B2BManagement />} />
            <Route path="/cheatsheets" element={<Cheatsheets />} />
            <Route path="/study-materials" element={<StudyMaterials />} />
            <Route path="/cutoffs" element={<CutoffsManagement />} />
            <Route path="/exams" element={<ExamManagement />} />
            <Route path="/battle-questions" element={<BattleQuestions />} />
            <Route path="/utm-generator" element={<UTMGenerator />} />
            <Route path="/link-shortener" element={<LinkShortener />} />
            <Route path="/meta-previewer" element={<MetaPreviewer />} />
            <Route path="/segmentation" element={<UserSegmentation />} />
            <Route path="/health" element={<Health />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
