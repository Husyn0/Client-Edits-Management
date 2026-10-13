import { useEffect, useState } from 'react';
import api from '../api';

const empty = {
  client_id:'', title:'', description:'', due_date:'',
  priority:'Medium', payment:'', is_paid:false, status:'pending'
};

export default function Edits() {
  const [edits, setEdits] = useState([]);
  const [clients, setClients] = useState([]);
  const [filters, setFilters] = useState({ status:'', priority:'', search:'' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [uploadEdit, setUploadEdit] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k,v]) => v && p.append(k,v));
    api.get(`/edits?${p}`).then(r => setEdits(r.data.data));
  };

  useEffect(() => { load(); }, [filters]);
  useEffect(() => { api.get('/clients').then(r => setClients(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e) => { setEditing(e); setForm({ ...e, client_id: e.client_id }); setModalOpen(true); };

  const save = async (ev) => {
    ev.preventDefault();
    const payload = { ...form, payment: form.payment || null, due_date: form.due_date || null };
    if (editing) await api.put(`/edits/${editing.id}`, payload);
    else await api.post('/edits', payload);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this edit?')) return;
    await api.delete(`/edits/${id}`); load();
  };

  const handleUpload = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    setUploading(true);
    try {
      await api.post(`/edits/${uploadEdit.id}/attachments`, fd);
      alert('Uploaded!');
      setUploadEdit(null);
    } catch { alert('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <>
      <div className="page-header">
        <h1>Edits</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Edit</button>
      </div>

      <div style={{ display:'flex', gap: 8, marginBottom: 16 }}>
        <input className="input" placeholder="Search title..." style={{ maxWidth: 240 }}
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })} />
        <select className="input" style={{ maxWidth: 160 }} value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['pending','approved','in_progress','done','cancelled'].map(s =>
            <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 160 }} value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th><th>Client</th><th>Status</th><th>Priority</th>
            <th>Due</th><th>Payment</th><th>Files</th><th></th>
          </tr>
        </thead>
        <tbody>
          {edits.map(e => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.client?.name}</td>
              <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
              <td><span className={`badge badge-${e.priority}`}>{e.priority}</span></td>
              <td>{e.due_date || '-'}</td>
              <td>{e.payment ? `$${e.payment} ${e.is_paid ? '✅' : '⏳'}` : '-'}</td>
              <td>{e.attachments_count}</td>
              <td style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                <button className="btn btn-ghost" onClick={() => setUploadEdit(e)}>📎</button>{' '}
                <button className="btn btn-ghost" onClick={() => openEdit(e)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(e.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Edit</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Client</label>
                <select className="input" value={form.client_id} required
                  onChange={e => setForm({ ...form, client_id: e.target.value })}>
                  <option value="">Select...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Title</label>
                <input className="input" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows="3" value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="input" value={form.due_date || ''}
                  onChange={e => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select className="input" value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="input" value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}>
                  {['pending','approved','in_progress','done','cancelled'].map(s =>
                    <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Payment (optional)</label>
                <input type="number" step="0.01" className="input" value={form.payment || ''}
                  onChange={e => setForm({ ...form, payment: e.target.value })} />
              </div>
              <div className="form-group">
                <label>
                  <input type="checkbox" checked={form.is_paid}
                    onChange={e => setForm({ ...form, is_paid: e.target.checked })} /> Is Paid
                </label>
              </div>
              <div style={{ display:'flex', gap: 8, justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost"
                  onClick={() => setModalOpen(false)}>Cancel</button>
                <button className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {uploadEdit && (
        <div className="modal-backdrop" onClick={() => !uploading && setUploadEdit(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Upload to: {uploadEdit.title}</h2>
            <p style={{ color:'#64748b', margin:'8px 0 16px', fontSize: 13 }}>
              PDF, images, docs — max 20MB
            </p>
            <input type="file" disabled={uploading}
              onChange={e => e.target.files[0] && handleUpload(e.target.files[0])} />
            {uploading && <p style={{ marginTop: 12 }}>Uploading...</p>}
          </div>
        </div>
      )}
    </>
  );
}