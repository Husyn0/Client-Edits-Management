import { useEffect, useState } from 'react';
import api from '../api/api';

const empty = { name:'', phone:'', email:'', company_name:'', service:'', last_contact_followup:'' };

export default function Clients() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = () => api.get(`/clients?search=${search}`).then(r => setClients(r.data.data));

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(empty); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModalOpen(true); };

  const save = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/clients/${editing.id}`, form);
    else await api.post('/clients', form);
    setModalOpen(false); load();
  };

  const remove = async (id) => {
    if (!confirm('Delete this client?')) return;
    await api.delete(`/clients/${id}`); load();
  };

  return (
    <>
      <div className="page-header">
        <h1>Clients</h1>
        <button className="btn btn-primary" onClick={openCreate}>+ New Client</button>
      </div>

      <input className="input" style={{ maxWidth: 320, marginBottom: 16 }}
        placeholder="Search clients..." value={search}
        onChange={e => setSearch(e.target.value)} />

      <table className="table">
        <thead>
          <tr>
            <th>Name</th><th>Company</th><th>Email</th><th>Phone</th>
            <th>Service</th><th>Last Contact</th><th>Edits</th><th></th>
          </tr>
        </thead>
        <tbody>
          {clients.map(c => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.company_name}</td>
              <td>{c.email}</td>
              <td>{c.phone}</td>
              <td>{c.service}</td>
              <td>{c.last_contact_followup || '-'}</td>
              <td>{c.edits_count}</td>
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
            <h2 style={{ marginBottom: 16 }}>{editing ? 'Edit' : 'New'} Client</h2>
            <form onSubmit={save}>
              {['name','phone','email','company_name','service'].map(f => (
                <div className="form-group" key={f}>
                  <label>{f.replace('_',' ')}</label>
                  <input className="input" value={form[f] || ''}
                    onChange={e => setForm({ ...form, [f]: e.target.value })} required />
                </div>
              ))}
              <div className="form-group">
                <label>Last Contact Followup</label>
                <input type="date" className="input" value={form.last_contact_followup || ''}
                  onChange={e => setForm({ ...form, last_contact_followup: e.target.value })} />
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