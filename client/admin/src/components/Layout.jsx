import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthCtx } from '../App';

const NAV = [
  { section: 'Main' },
  { to: '/dashboard', label: '📊 Dashboard' },
  { section: 'Exam Platform' },
  { to: '/tests',     label: '📝 Test Management' },
  { to: '/b2b',       label: '🏢 B2B Coaching' },
  { section: 'Data' },
  { to: '/users',     label: '👤 Users' },
  { to: '/cheatsheets',label: '📋 Cheatsheets' },
  { to: '/sessions',  label: '🔐 Sessions' },
  { to: '/resources', label: '📁 Resources' },
  { to: '/feedback',  label: '💬 Feedback' },
  { section: 'System' },
  { to: '/settings',  label: '⚙️ Settings' },
  { to: '/health',    label: '🩺 Health Monitor' },
];

export default function Layout() {
  const { user, logout } = useContext(AuthCtx);
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/'); };

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Vayl <span>Admin</span></div>
        <nav>
          {NAV.map((item, i) =>
            item.section
              ? <div key={i} className="sidebar-section">{item.section}</div>
              : <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'active' : ''}>
                  {item.label}
                </NavLink>
          )}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 6 }}>
            Signed in as<br />
            <strong style={{ color: '#ecf0f1' }}>{user?.email}</strong>
          </div>
          <button className="btn btn-sm btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <span className="topbar-title">Vayl Admin Panel</span>
          <div className="topbar-right">
            <span>v1.0</span>
            <span className="topbar-user">{user?.name}</span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
