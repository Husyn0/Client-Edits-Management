import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';

const STATUS_COLORS = {
  pending: '#f59e0b',
  approved: '#3b82f6',
  in_progress: '#8b5cf6',
  done: '#10b981',
  cancelled: '#ef4444',
};

const PRIORITY_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#3b82f6',
};

const PAYMENT_COLORS = {
  paid: '#10b981',
  unpaid: '#f59e0b',
  no_payment: '#94a3b8',
};

const PAYMENT_LABELS = {
  paid: 'Paid',
  unpaid: 'Unpaid',
  no_payment: 'Free',
};

const FILE_TYPE_COLORS = [
  '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b',
  '#10b981', '#3b82f6', '#ef4444', '#64748b',
];

const prettyStatus = (s) => s.replace(/_/g, ' ');

const localISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const fmtSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const bucketMime = (mime) => {
  if (!mime) return 'Other';
  if (mime.startsWith('image/')) return 'Images';
  if (mime.startsWith('video/')) return 'Videos';
  if (mime.startsWith('audio/')) return 'Audio';
  if (mime === 'application/pdf') return 'PDF';
  if (mime.includes('word') || mime.includes('document')) return 'Documents';
  if (mime.includes('sheet') || mime.includes('excel')) return 'Spreadsheets';
  if (mime.startsWith('text/')) return 'Text';
  if (mime.includes('zip') || mime.includes('compressed')) return 'Archives';
  return 'Other';
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentEdits, setRecentEdits] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/edits?per_page=1000'),
      api.get('/edits?per_page=5'),
      api.get('/attachments'),
    ]).then(([s, all, recent, att]) => {
      const edits = all.data.data || [];
      const attachments = att.data.data || [];

      const by_status = edits.reduce((acc, e) => {
        acc[e.status] = (acc[e.status] || 0) + 1;
        return acc;
      }, {});

      const by_priority = edits.reduce((acc, e) => {
        acc[e.priority] = (acc[e.priority] || 0) + 1;
        return acc;
      }, {});

      const by_payment = edits.reduce(
        (acc, e) => {
          if (e.payment == null) acc.no_payment += 1;
          else if (e.is_paid) acc.paid += 1;
          else acc.unpaid += 1;
          return acc;
        },
        { paid: 0, unpaid: 0, no_payment: 0 }
      );

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const days = [];
      for (let i = -14; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        days.push({ date: localISO(d), count: 0 });
      }

      const dayMap = Object.fromEntries(days.map((d) => [d.date, d]));
      edits.forEach((e) => {
        if (!e.due_date) return;
        const key = String(e.due_date).slice(0, 10);
        if (dayMap[key]) dayMap[key].count += 1;
      });

      const by_file_type = attachments.reduce((acc, a) => {
        const bucket = bucketMime(a.mime_type);
        if (!acc[bucket]) acc[bucket] = { count: 0, size: 0 };
        acc[bucket].count += 1;
        acc[bucket].size += Number(a.size) || 0;
        return acc;
      }, {});

      const attachments_total = {
        count: attachments.length,
        size: attachments.reduce((sum, a) => sum + (Number(a.size) || 0), 0),
      };

      setStats({
        ...s.data,
        by_status,
        by_priority,
        by_payment,
        by_due_date: days,
        by_file_type,
        attachments_total,
      });
      setRecentEdits(recent.data.data || []);
    });
  }, []);

  const statusData = useMemo(() => {
    if (!stats?.by_status) return [];
    return Object.entries(stats.by_status).map(([key, value]) => ({
      name: prettyStatus(key),
      key,
      value,
    }));
  }, [stats]);

  const priorityData = useMemo(() => {
    if (!stats?.by_priority) return [];
    return Object.entries(stats.by_priority).map(([key, value]) => ({
      name: key,
      value,
    }));
  }, [stats]);

  const paymentData = useMemo(() => {
    if (!stats?.by_payment) return [];
    return Object.entries(stats.by_payment).map(([key, value]) => ({
      name: PAYMENT_LABELS[key] ?? key,
      key,
      value,
    }));
  }, [stats]);

  const dueDateData = useMemo(() => {
    if (!stats?.by_due_date) return [];
    return stats.by_due_date.map((row) => {
      const d = new Date(row.date + 'T00:00:00');
      return {
        date: row.date,
        label: d.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
        }),
        count: row.count,
      };
    });
  }, [stats]);

  const fileTypeCountData = useMemo(() => {
    if (!stats?.by_file_type) return [];
    return Object.entries(stats.by_file_type)
      .map(([name, v]) => ({ name, count: v.count }))
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const fileTypeSizeData = useMemo(() => {
    if (!stats?.by_file_type) return [];
    return Object.entries(stats.by_file_type)
      .map(([name, v]) => ({ name, size: v.size }))
      .sort((a, b) => b.size - a.size);
  }, [stats]);

  if (!stats) return <div>Loading...</div>;

  const { attachments_total } = stats;

  return (
    <>
      <div className="page-header"><h1>Dashboard</h1></div>

      <div className="grid-cards">
        <div className="card stat-card">
          <div className="stat-label">Clients</div>
          <div className="stat-value">{stats.total_clients}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Companies</div>
          <div className="stat-value">{stats.total_companies ?? 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Services</div>
          <div className="stat-value">{stats.total_services ?? 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total Edits</div>
          <div className="stat-value">{stats.total_edits}</div>
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

      <div className="charts-grid">
        {/* Status */}
        <div className="card chart-card">
          <h3>Edits by status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((entry) => (
                  <Cell key={entry.key} fill={STATUS_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Priority */}
        <div className="card chart-card">
          <h3>Edits by priority</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={priorityData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((entry) => (
                  <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment */}
        <div className="card chart-card">
          <h3>Payment status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {paymentData.map((entry) => (
                  <Cell key={entry.key} fill={PAYMENT_COLORS[entry.key]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Due dates */}
        <div className="card chart-card">
          <h3>Edits due (last &amp; next 14 days)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart
              data={dueDateData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" interval={2} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#4f46e5"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Attachments — count by type */}
        <div className="card chart-card">
          <h3>
            Attachments by type
            <span className="chart-sub">
              {attachments_total.count} files · {fmtSize(attachments_total.size)}
            </span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={fileTypeCountData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} domain={[0, 'dataMax + 1']} />
              <Tooltip formatter={(v) => `${v} file${v === 1 ? '' : 's'}`} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {fileTypeCountData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={FILE_TYPE_COLORS[i % FILE_TYPE_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attachments — total size by type */}
        <div className="card chart-card">
          <h3>
            Storage used by type
            <span className="chart-sub">{fmtSize(attachments_total.size)} total</span>
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={fileTypeSizeData}
                dataKey="size"
                nameKey="name"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {fileTypeSizeData.map((entry, i) => (
                  <Cell
                    key={entry.name}
                    fill={FILE_TYPE_COLORS[i % FILE_TYPE_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmtSize(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Recent Edits</h3>
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Client</th><th>Status</th><th>Priority</th></tr>
          </thead>
          <tbody>
            {recentEdits.map((e) => (
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