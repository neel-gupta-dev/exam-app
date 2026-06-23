import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthCtx } from '../App';

const NAV = [
  { section: 'Main' },
  { to: '/dashboard', label: '📊 Dashboard' },
  { section: 'Exam Platform' },
  { to: '/tests', label: '📝 Test Management' },
  { to: '/test-telemetry', label: '📡 Test Telemetry' },
  { to: '/b2b', label: '🏢 B2B Coaching' },
  { to: '/battle-questions', label: '⚔️ Battle Questions' },
  { section: 'Data' },
  { to: '/users', label: '👤 Users' },
  { to: '/writers', label: '✍️ Writers' },
  { to: '/cutoffs', label: '📈 Predictor Cutoffs' },
  { to: '/exams', label: '📅 Track Exams' },
  { to: '/cheatsheets', label: '📋 Cheatsheets' },
  { to: '/study-materials', label: '📚 Study Materials' },
  { to: '/sessions', label: '🔐 Sessions' },
  { to: '/resources', label: '📁 Resources' },
  { to: '/feedback', label: '💬 Feedback' },
  { section: 'Marketing' },
  { to: '/utm-generator', label: '🚀 UTM Generator' },
  { to: '/link-shortener', label: '✂️ Link Shortener' },
  { to: '/meta-previewer', label: '📱 Social Meta Preview' },
  { to: '/segmentation', label: '🎯 User Segmentation' },
  { section: 'System' },
  { to: '/settings', label: '⚙️ Settings' },
  { to: '/health', label: '🩺 Health Monitor' },
];

export default function Layout() {
  const { user, logout } = useContext(AuthCtx);
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/'); };

  const filteredNav = NAV.filter(item => {
    if (user?.role === 'subAdmin') {
      const restricted = ['/b2b', '/battle-questions', '/users', '/writers', '/sessions', '/resources'];
      if (item.to && restricted.includes(item.to)) return false;
    }
    return true;
  });

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">Vayl <span>Admin</span></div>
        <nav>
          {filteredNav.map((item, i) =>
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
            <span>v1.4</span>
            <span className="topbar-user">
              {user?.name}
              {user?.role === 'subAdmin' && <span style={{ marginLeft: 8, fontSize: 10, backgroundColor: '#f39c12', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Sub-Admin</span>}
            </span>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
