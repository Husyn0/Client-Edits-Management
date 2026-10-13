import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEdits, setRecentEdits] = useState([]);

  useEffect(() => {
    api.get('/stats').then(r => setStats(r.data));
    api.get('/edits?per_page=5').then(r => setRecentEdits(r.data.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <>
      <div className="page-header"><h1>Dashboard</h1></div>

      <div className="grid-cards">
        <div className="card stat-card">
          <div className="stat-label">Clients</div>
          <div className="stat-value">{stats.total_clients}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total Edits</div>
          <div className="stat-value">{stats.total_edits}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{stats.in_progress}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Done</div>
          <div className="stat-value">{stats.done}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value">${stats.paid_total}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Unpaid</div>
          <div className="stat-value">${stats.unpaid_total}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Edits</h3>
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Client</th><th>Status</th><th>Priority</th></tr>
          </thead>
          <tbody>
            {recentEdits.map(e => (
              <tr key={e.id}>
                <td>{e.title}</td>
                <td>{e.client?.name}</td>
                <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                <td><span className={`badge badge-${e.priority}`}>{e.priority}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}