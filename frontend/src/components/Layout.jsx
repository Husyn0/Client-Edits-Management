import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiMenuAlt2, HiX, HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';
import {
  HiOutlineViewGrid, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineCube, HiOutlinePencilAlt, HiOutlinePaperClip,
} from 'react-icons/hi';

const NAV = [
  { to: '/', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
  { to: '/clients', label: 'Clients', icon: HiOutlineUsers },
  { to: '/companies', label: 'Companies', icon: HiOutlineOfficeBuilding },
  { to: '/services', label: 'Services', icon: HiOutlineCube },
  { to: '/edits', label: 'Edits', icon: HiOutlinePencilAlt },
  { to: '/attachments', label: 'Attachments', icon: HiOutlinePaperClip },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar_collapsed') === '1'
  );

  useEffect(() => {
    localStorage.setItem('sidebar_collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div
      className={[
        'app-layout',
        collapsed ? 'sidebar-collapsed' : '',
        mobileOpen ? 'sidebar-open' : '',
      ].join(' ')}
    >
      <button
        className="sidebar-toggle"
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(o => !o)}
      >
        {mobileOpen ? <HiX size={22} /> : <HiMenuAlt2 size={22} />}
      </button>

      <div
        className="sidebar-backdrop"
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      <aside className="sidebar">
        <div className="sidebar-head">
          <span className="brand-text">Edits Manager</span>
          <button
            className="collapse-btn"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!collapsed}
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <HiChevronRight size={18} /> : <HiChevronLeft size={18} />}
          </button>
        </div>

        <nav onClick={() => setMobileOpen(false)}>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="nav-link"
              data-tooltip={label}
            >
              <Icon size={20} className="nav-icon" />
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="user-box">
          <div className="user-name">{user?.name}</div>
          <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}