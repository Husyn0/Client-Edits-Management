import { useEffect, useMemo, useState } from 'react';
import api from '../api/api';

export default function Attachments() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const load = () => api.get('/attachments').then(r => setFiles(r.data.data || []));
  useEffect(() => { load(); }, []);

  const download = (id, name) => {
    const token = localStorage.getItem('token');
    fetch(`/api/attachments/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.blob()).then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    });
  };

  const remove = async (id) => {
    if (!confirm('Delete this file?')) return;
    await api.delete(`/attachments/${id}`); load();
  };

  const fmtSize = (b) => {
    if (b < 1024) return `${b} B`;
    if (b < 1048576) return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1048576).toFixed(1)} MB`;
  };

  const q = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!q) return files;
    return files.filter(f => {
      const haystack = [
        f.original_name,
        f.mime_type,
        f.edit?.title,
        f.edit?.client?.name,
        f.edit?.service?.name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [files, q]);

  // Reset to page 1 on search / per-page change
  useEffect(() => { setPage(1); }, [search, perPage]);

  const total = filtered.length;
  const last_page = Math.max(1, Math.ceil(total / perPage));
  const current_page = Math.min(page, last_page);
  const startIdx = (current_page - 1) * perPage;
  const visible = filtered.slice(startIdx, startIdx + perPage);

  const meta = {
    current_page,
    last_page,
    total,
    per_page: perPage,
  };

  return (
    <>
      <div className="page-header"><h1>Attachments</h1></div>

      <div className="toolbar">
        <input className="input" style={{ maxWidth: 320 }}
          placeholder="Search by file, edit, client, service..."
          value={search}
          onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 120 }}
          value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          {[10, 15, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>File</th><th>Edit</th><th>Client</th><th>Service</th>
            <th>Type</th><th>Size</th><th>Uploaded</th><th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(f => (
            <tr key={f.id}>
              <td>{f.original_name}</td>
              <td>{f.edit?.title}</td>
              <td>{f.edit?.client?.name}</td>
              <td>{f.edit?.service?.name}</td>
              <td>{f.mime_type}</td>
              <td>{fmtSize(f.size)}</td>
              <td>{new Date(f.created_at).toLocaleDateString()}</td>
              <td style={{ textAlign: 'right' }}>
                <button className="btn btn-ghost"
                  onClick={() => download(f.id, f.original_name)}>⬇ Download</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(f.id)}>Del</button>
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={8} className="empty-row">
                {q ? 'No attachments match your search.' : 'No attachments yet.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination meta={meta} page={page} setPage={setPage} />
    </>
  );
}

function Pagination({ meta, page, setPage }) {
  const { last_page, total, per_page, current_page } = meta;
  if (!total) return null;

  const from = (current_page - 1) * per_page + 1;
  const to = Math.min(current_page * per_page, total);

  const pages = [];
  const maxButtons = 5;
  let start = Math.max(1, current_page - Math.floor(maxButtons / 2));
  let end = Math.min(last_page, start + maxButtons - 1);
  start = Math.max(1, end - maxButtons + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {from}–{to} of {total}
      </span>
      <div className="pagination-controls">
        <button className="btn btn-ghost"
          disabled={current_page <= 1}
          onClick={() => setPage(current_page - 1)}>
          ‹ Prev
        </button>
        {start > 1 && (
          <>
            <button className="btn btn-ghost" onClick={() => setPage(1)}>1</button>
            {start > 2 && <span className="pagination-ellipsis">…</span>}
          </>
        )}
        {pages.map(n => (
          <button key={n}
            className={`btn ${n === current_page ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPage(n)}>
            {n}
          </button>
        ))}
        {end < last_page && (
          <>
            {end < last_page - 1 && <span className="pagination-ellipsis">…</span>}
            <button className="btn btn-ghost" onClick={() => setPage(last_page)}>{last_page}</button>
          </>
        )}
        <button className="btn btn-ghost"
          disabled={current_page >= last_page}
          onClick={() => setPage(current_page + 1)}>
          Next ›
        </button>
      </div>
    </div>
  );
}