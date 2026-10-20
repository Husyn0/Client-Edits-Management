import { useEffect, useState } from 'react';
import api from '../api/api';

const empty = { company_id:'', name:'', description:'', base_price:'' };

export default function Services() {
  const [services, setServices] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (companyFilter) p.append('company_id', companyFilter);
    api.get(`/services?${p}`).then(r => setServices(r.data.data));
  };

  useEffect(() => { load(); }, [search, companyFilter]);
  useEffect(() => { api.get('/companies?per_page=1000').then(r => setCompanies(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (s) => {
    setEditing(s);
    setForm({
      company_id: s.company_id,
      name: s.name,
      description: s.description || '',
      base_price: s.base_price ?? '',
    });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const payload = { ...form, base_price: form.base_price === '' ? null : form.base_price };
    if (editing) await api.put(`/services/${editing.id}`, payload);
    else await api.post('/services', payload);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this service? This will cascade to edits and attachments.')) return;
    await api.delete(`/services/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <h1>Services</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Service</button>
      </div>

      <div style={{ display:'flex', gap: 8, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="Search services..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 280 }}
          value={companyFilter} onChange={e => setCompanyFilter(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.client?.name}</option>
          ))}
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Company</th><th>Client</th>
            <th>Base Price</th><th>Edits</th><th></th>
          </tr>
        </thead>
        <tbody>
          {services.map(s => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.company?.name}</td>
              <td>{s.company?.client?.name}</td>
              <td>{s.base_price != null ? `$${Number(s.base_price).toFixed(2)}` : '-'}</td>
              <td>{s.edits_count ?? 0}</td>
              <td style={{ textAlign:'right' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(s)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(s.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Service</h2>
            <form onSubmit={save}>
              <div className="form-group">
                <label>Company</label>
                <select className="input" value={form.company_id} required
                  onChange={e => setForm({ ...form, company_id: e.target.value })}>
                  <option value="">Select...</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.client?.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input className="input" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="input" rows="3" value={form.description || ''}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Base Price</label>
                <input type="number" step="0.01" className="input" value={form.base_price ?? ''}
                  onChange={e => setForm({ ...form, base_price: e.target.value })} />
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
    </>
  );
}