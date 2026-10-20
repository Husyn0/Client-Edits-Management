import { useEffect, useMemo, useState } from 'react';
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

const PAYMENT_OPTIONS = [
  { value: '', label: 'All payments' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'free', label: 'Free (no payment)' },
];

export default function Edits() {
  const [edits, setEdits] = useState([]);
  const [clients, setClients] = useState([]);
  const [services, setServices] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    payment: '',       // '' | 'paid' | 'unpaid' | 'free'
    client_id: '',
    service_id: '',
    company_id: '',    // client-side (via edit.service.company.id)
  });

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [uploadEdit, setUploadEdit] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    const p = new URLSearchParams();
    if (filters.search) p.append('search', filters.search);
    if (filters.status) p.append('status', filters.status);
    if (filters.priority) p.append('priority', filters.priority);
    if (filters.client_id) p.append('client_id', filters.client_id);
    if (filters.service_id) p.append('service_id', filters.service_id);
    p.append('page', page);
    p.append('per_page', perPage);
    api.get(`/edits?${p}`).then(r => {
      setEdits(r.data.data);
      setMeta({
        current_page: r.data.current_page ?? 1,
        last_page: r.data.last_page ?? 1,
        total: r.data.total ?? r.data.data.length,
        per_page: r.data.per_page ?? perPage,
      });
    });
  };

  useEffect(() => { load(); }, [filters, page, perPage]);
  useEffect(() => { setPage(1); }, [filters, perPage]);

  useEffect(() => {
    api.get('/clients?per_page=1000').then(r => setClients(r.data.data));
    api.get('/services?per_page=1000').then(r => setServices(r.data.data));
    api.get('/companies?per_page=1000').then(r => setCompanies(r.data.data));
  }, []);

  // Client-side: payment + company filters applied on top of server results
  const visible = useMemo(() => {
    return edits.filter(e => {
      if (filters.payment) {
        if (filters.payment === 'free' && e.payment != null) return false;
        if (filters.payment === 'paid' && !(e.payment != null && e.is_paid)) return false;
        if (filters.payment === 'unpaid' && !(e.payment != null && !e.is_paid)) return false;
      }
      if (filters.company_id) {
        const cid = e.service?.company?.id ?? e.service?.company_id;
        if (String(cid) !== String(filters.company_id)) return false;
      }
      return true;
    });
  }, [edits, filters.payment, filters.company_id]);

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

  const servicesFilteredByCompany = filters.company_id
    ? services.filter(s => String(s.company?.id ?? s.company_id) === String(filters.company_id))
    : services;

  const resetFilters = () => {
    setFilters({
      search: '', status: '', priority: '', payment: '',
      client_id: '', service_id: '', company_id: '',
    });
    setPage(1);
  };

  const hasAnyFilter = Object.values(filters).some(v => v);

  return (
    <>
      <div className="page-header">
        <h1>Edits</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Edit</button>
      </div>

      <div className="toolbar">
        <input className="input" placeholder="Search title..." style={{ maxWidth: 200 }}
          value={filters.search}
          onChange={e => setFilters({ ...filters, search: e.target.value })} />
        <select className="input" style={{ maxWidth: 150 }} value={filters.status}
          onChange={e => setFilters({ ...filters, status: e.target.value })}>
          <option value="">All Statuses</option>
          {['pending','approved','in_progress','done','cancelled'].map(s =>
            <option key={s}>{s}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 150 }} value={filters.priority}
          onChange={e => setFilters({ ...filters, priority: e.target.value })}>
          <option value="">All Priorities</option>
          {['High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 170 }} value={filters.payment}
          onChange={e => setFilters({ ...filters, payment: e.target.value })}>
          {PAYMENT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 180 }} value={filters.client_id}
          onChange={e => setFilters({ ...filters, client_id: e.target.value, service_id: '' })}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 220 }} value={filters.company_id}
          onChange={e => setFilters({ ...filters, company_id: e.target.value, service_id: '' })}>
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.client?.name}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 220 }} value={filters.service_id}
          onChange={e => setFilters({ ...filters, service_id: e.target.value })}>
          <option value="">All Services</option>
          {servicesFilteredByCompany.map(s => (
            <option key={s.id} value={s.id}>{s.name} — {s.company?.name}</option>
          ))}
        </select>
        <select className="input" style={{ maxWidth: 120 }}
          value={perPage} onChange={e => setPerPage(Number(e.target.value))}>
          {[10, 15, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>
        {hasAnyFilter && (
          <button className="btn btn-ghost" onClick={resetFilters}>Reset</button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th><th>Client</th><th>Company</th><th>Service</th>
            <th>Status</th><th>Priority</th><th>Due</th><th>Payment</th><th>Files</th><th></th>
          </tr>
        </thead>
        <tbody>
          {visible.map(e => (
            <tr key={e.id}>
              <td>{e.title}</td>
              <td>{e.client?.name}</td>
              <td>{e.service?.company?.name}</td>
              <td>{e.service?.name}</td>
              <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
              <td><span className={`badge badge-${e.priority}`}>{e.priority}</span></td>
              <td>{fmtDate(e.due_date)}</td>
              <td>{e.payment ? `$${e.payment} ${e.is_paid ? '✅' : '⏳'}` : 'Free'}</td>
              <td>{e.attachments_count}</td>
              <td style={{ textAlign:'right', whiteSpace:'nowrap' }}>
                <button className="btn btn-ghost" onClick={() => setUploadEdit(e)}>📎</button>{' '}
                <button className="btn btn-ghost" onClick={() => openEdit(e)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(e.id)}>Del</button>
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={10} className="empty-row">
                {edits.length === 0 ? 'No edits found.' : 'No edits match the current filters.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination meta={meta} page={page} setPage={setPage} />

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
                  {services.map(s => (
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
      <span className="pagination-info">Showing {from}–{to} of {total}</span>
      <div className="pagination-controls">
        <button className="btn btn-ghost" disabled={current_page <= 1}
          onClick={() => setPage(current_page - 1)}>‹ Prev</button>
        {start > 1 && (
          <>
            <button className="btn btn-ghost" onClick={() => setPage(1)}>1</button>
            {start > 2 && <span className="pagination-ellipsis">…</span>}
          </>
        )}
        {pages.map(n => (
          <button key={n}
            className={`btn ${n === current_page ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setPage(n)}>{n}</button>
        ))}
        {end < last_page && (
          <>
            {end < last_page - 1 && <span className="pagination-ellipsis">…</span>}
            <button className="btn btn-ghost" onClick={() => setPage(last_page)}>{last_page}</button>
          </>
        )}
        <button className="btn btn-ghost" disabled={current_page >= last_page}
          onClick={() => setPage(current_page + 1)}>Next ›</button>
      </div>
    </div>
  );
}