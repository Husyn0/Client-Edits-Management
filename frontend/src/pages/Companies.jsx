import { useEffect, useState } from 'react';
import api from '../api/api';

const empty = { client_id:'', name:'', phone:'', email:'', address:'' };

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => {
    const p = new URLSearchParams();
    if (search) p.append('search', search);
    if (clientFilter) p.append('client_id', clientFilter);
    api.get(`/companies?${p}`).then(r => setCompanies(r.data.data));
  };

  useEffect(() => { load(); }, [search, clientFilter]);
  useEffect(() => { api.get('/clients').then(r => setClients(r.data.data)); }, []);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ client_id: c.client_id, name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '' });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/companies/${editing.id}`, form);
    else await api.post('/companies', form);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this company? This will cascade to services, edits, and attachments.')) return;
    await api.delete(`/companies/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <h1>Companies</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Company</button>
      </div>

      <div style={{ display:'flex', gap: 8, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 240 }} placeholder="Search companies..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 240 }}
          value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
          <option value="">All Clients</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Client</th><th>Email</th><th>Phone</th>
            <th>Address</th><th>Services</th><th></th>
          </tr>
        </thead>
        <tbody>
          {companies.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.client?.name}</td>
              <td>{c.email || '-'}</td>
              <td>{c.phone || '-'}</td>
              <td>{c.address || '-'}</td>
              <td>{c.services_count ?? 0}</td>
              <td style={{ textAlign:'right' }}>
                <button className="btn btn-ghost" onClick={() => openEdit(c)}>Edit</button>{' '}
                <button className="btn btn-danger" onClick={() => remove(c.id)}>Del</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Company</h2>
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
                <label>Name</label>
                <input className="input" value={form.name} required
                  onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="input" value={form.phone || ''}
                  onChange={e => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" className="input" value={form.email || ''}
                  onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input className="input" value={form.address || ''}
                  onChange={e => setForm({ ...form, address: e.target.value })} />
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