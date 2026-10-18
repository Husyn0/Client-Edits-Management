import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2 className="brand">📋 Edits Manager</h2>
        <nav>
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/clients">Clients</NavLink>
          <NavLink to="/edits">Edits</NavLink>
          <NavLink to="/attachments">Attachments</NavLink>
        </nav>
        <div className="user-box">
          <div className="user-name">{user?.name}</div>
          <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}