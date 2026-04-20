import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetail from './pages/UserDetail';
import Sessions from './pages/Sessions';
import Resources from './pages/Resources';
import FeedbackPage from './pages/Feedback';
import Health from './pages/Health';
import Settings from './pages/Settings';
import TestManagement from './pages/TestManagement';
import B2BManagement from './pages/B2BManagement';
import Cheatsheets from './pages/Cheatsheets';
import Layout from './components/Layout';

export const AuthCtx = createContext(null);

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
      <BrowserRouter basename={import.meta.env.VITE_ADMIN_BASE || '/sys-9f3k-ctrl'}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserDetail />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/tests" element={<TestManagement />} />
            <Route path="/b2b" element={<B2BManagement />} />
            <Route path="/cheatsheets" element={<Cheatsheets />} />
            <Route path="/health" element={<Health />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
