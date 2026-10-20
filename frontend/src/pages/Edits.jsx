import { useEffect, useState } from 'react';
import api from '../api/api';

const empty = {
  client_id:'', service_id:'', title:'', description:'', due_date:'',
  priority:'Medium', payment:'', is_paid:false, status:'pending'
};

const fmtDate = (v) => {
  if (!v) return '-';
  const d = new Date(String(v).slice(0, 10) + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

export default function Edits() {
  const [edits, setEdits] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({ status:'', priority:'', search:'', service_id:'' });
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
  useEffect(() => {
    api.get('/clients?per_page=1000').then(r => setClients(r.data.data));
    api.get('/services?per_page=1000').then(r => setServices(r.data.data));
  }, []);

  // Services filtered by selected client's companies
  const servicesForClient = form.client_id
    ? services.filter(s => {
        const client = clients.find(c => String(c.id) === String(form.client_id));
        return true; // backend will validate; keep all services
      })
    : services;

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (e) => {
    setEditing(e);
    setForm({
      ...empty,
      ...e,
      client_id: e.client_id ?? e.client?.id ?? '',
      service_id: e.service_id ?? e.service?.id ?? '',
    });
    setModalOpen(true);
  };

  const save = async (ev) => {
    ev.preventDefault();
    const payload = {
      ...form,
      payment: form.payment === '' || form.payment == null ? null : form.payment,
      due_date: form.due_date || null,
    };
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

      <div style={{ display:'flex', gap: 8, marginBottom: 16, flexWrap:'wrap' }}>
        <input className="input" placeholder="Search title..." style={{ maxWidth: 220 }}
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
        <select className="input" style={{ maxWidth: 260 }} value={filters.service_id}
          onChange={e => setFilters({ ...filters, service_id: e.target.value })}>
          <option value="">All Services</option>
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.company?.name}</option>
          ))}
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th><th>Client</th><th>Service</th><th>Status</th><th>Priority</th>
            <th>Due</th><th>Payment</th><th>Files</th><th></th>
          </tr>
        </thead>
        <tbody>
          {edits.map(e => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.client?.name}</td>
              <td>{e.service?.name}</td>
              <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
              <td><span className={`badge badge-${e.priority}`}>{e.priority}</span></td>
              <td>{fmtDate(e.due_date)}</td>
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
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Service</label>
                <select className="input" value={form.service_id} required
                  onChange={e => setForm({ ...form, service_id: e.target.value })}>
                  <option value="">Select...</option>
                  {servicesForClient.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.company?.name}
                    </option>
                  ))}
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