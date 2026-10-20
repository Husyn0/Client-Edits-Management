import { useEffect, useState } from 'react';
import api from '../api/api';

export default function Attachments() {
  const [files, setFiles] = useState([]);
  const [search, setSearch] = useState('');

  const load = () => api.get('/attachments').then(r => setFiles(r.data.data));
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
  const filtered = q
    ? files.filter(f => {
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
      })
    : files;

  return (
    <>
      <div className="page-header"><h1>Attachments</h1></div>

      <input className="input" style={{ maxWidth: 320, marginBottom: 16 }}
        placeholder="Search by file, edit, client, service..."
        value={search}
        onChange={e => setSearch(e.target.value)} />

      <table className="table">
        <thead>
          <tr>
            <th>File</th><th>Edit</th><th>Client</th><th>Service</th>
            <th>Type</th><th>Size</th><th>Uploaded</th><th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(f => (
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
          {filtered.length === 0 && (
            <tr>
              <td colSpan={8} style={{ textAlign: 'center', color: '#64748b', padding: 24 }}>
                {q ? 'No attachments match your search.' : 'No attachments yet.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}